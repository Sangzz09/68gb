import asyncio
import json
import re
import os
import random
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import firebase_admin
from firebase_admin import credentials, db
import uvicorn

# -------------------------
# Cấu hình
# -------------------------
PORT = int(os.environ.get("PORT", 8000))
WS_ID = "minhsang"
WS_KEY = "2009"

SERVICE_ACCOUNT_FILE = "serviceAccount.json"
DATABASE_URL = "https://api6868-2a84a-default-rtdb.asia-southeast1.firebasedatabase.app/"

latestKey = None
waitingResult = None
latestResult = None
clients = set()
results_history = []
so_lan_dung = 0
so_lan_sai = 0
predicted_phien_set = set()

# -------------------------
# Firebase
# -------------------------
cred = credentials.Certificate(SERVICE_ACCOUNT_FILE)
firebase_admin.initialize_app(cred, {"databaseURL": DATABASE_URL})

# -------------------------
# FastAPI
# -------------------------
app = FastAPI()

# -------------------------
# Phân tích "end"
# -------------------------
def parse_end_data(data):
    match = re.search(r"#(\d+)[^\{]*\{(\d+)-(\d+)-(\d+)\}", data)
    if not match:
        return None
    phien = int(match.group(1))
    xuc_xac = [int(match.group(2)), int(match.group(3)), int(match.group(4))]
    tong = sum(xuc_xac)
    ket_qua = "Tài" if tong >= 11 else "Xỉu"
    return {"phien": phien, "xuc_xac": xuc_xac, "tong": tong, "ket_qua": ket_qua}

# -------------------------
# MD5
# -------------------------
def extract_md5(data):
    match = re.search(r"[0-9a-f]{32}$", data, re.I)
    return match.group(0) if match else None

# -------------------------
# Dự đoán nâng cao Markov + Monte Carlo adaptive
# -------------------------
def predict_advanced(history, steps=5, sims=3000):
    if not history:
        return random.choice(["Tài","Xỉu"]), 50
    last_seq = tuple(history[-steps:]) if len(history)>=steps else tuple(history)
    count = {"Tài":0,"Xỉu":0}
    for _ in range(sims):
        candidates = []
        for i in range(len(history)-len(last_seq)):
            if tuple(history[i:i+len(last_seq)])==last_seq:
                candidates.append(history[i+len(last_seq)])
        choice = random.choice(candidates) if candidates else random.choice(["Tài","Xỉu"])
        count[choice]+=1
    total = count["Tài"] + count["Xỉu"]
    if total==0:
        return random.choice(["Tài","Xỉu"]), 50
    if count["Tài"]>=count["Xỉu"]:
        return "Tài", int(count["Tài"]/total*100)
    else:
        return "Xỉu", int(count["Xỉu"]/total*100)

# -------------------------
# Broadcast WS
# -------------------------
async def broadcast(data):
    if not clients:
        return
    msg = json.dumps(data)
    for client in clients.copy():
        if getattr(client,"authenticated",False):
            try:
                await client.send_text(msg)
            except:
                clients.discard(client)

# -------------------------
# WebSocket
# -------------------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    query = dict(websocket.query_params)
    if query.get("id")==WS_ID and query.get("key")==WS_KEY:
        websocket.authenticated=True
        clients.add(websocket)
        await websocket.send_text(json.dumps({"status":"connected"}))
    else:
        await websocket.send_text(json.dumps({"status":"unauthorized"}))
        await websocket.close()
        return
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        clients.discard(websocket)

# -------------------------
# REST API
# -------------------------
@app.get("/68gbminhsang")
async def get_latest_result_minhsang():
    if latestResult:
        return JSONResponse(latestResult)
    else:
        return JSONResponse({"message":"Chưa có dữ liệu"},status_code=404)

# -------------------------
# Fetch Firebase liên tục
# -------------------------
async def fetch_firebase_loop():
    global latestKey, waitingResult, latestResult, results_history, so_lan_dung, so_lan_sai
    ref = db.reference("taixiu_sessions")
    while True:
        try:
            data = ref.get()
            if not data:
                await asyncio.sleep(3)
                continue
            keys = sorted(data.keys())
            latest = keys[-1]
            if latestKey==latest:
                await asyncio.sleep(3)
                continue
            latestKey=latest
            item = data[latest]
            if item.get("type")=="end":
                parsed = parse_end_data(item.get("data",""))
                if parsed:
                    waitingResult = parsed
                    results_history.append(parsed["ket_qua"])
            if item.get("type")=="start" and waitingResult:
                phien = waitingResult["phien"]
                if phien in predicted_phien_set:
                    waitingResult=None
                    await asyncio.sleep(1)
                    continue
                predicted_phien_set.add(phien)
                md5 = extract_md5(item.get("data",""))
                pattern = "".join(results_history[-20:])
                du_doan, do_tin_cay = predict_advanced(results_history, steps=5, sims=3000)
                # Thống kê
                if du_doan == waitingResult["ket_qua"]:
                    so_lan_dung+=1
                else:
                    so_lan_sai+=1
                ti_le_dung = int(so_lan_dung/(so_lan_dung+so_lan_sai)*100) if (so_lan_dung+so_lan_sai)>0 else 0
                latestResult = {
                    "Phien": phien,
                    "Ket_qua": waitingResult["ket_qua"],
                    "Xuc_xac": waitingResult["xuc_xac"],
                    "Md5": md5 if md5 else None,
                    "Pattern": pattern,
                    "Du_doan": du_doan,
                    "Do_tin_cay": do_tin_cay,
                    "So_lan_dung": so_lan_dung,
                    "So_lan_sai": so_lan_sai,
                    "Ti_le_dung": ti_le_dung,
                    "Id":"@minhsangdangcap"
                }
                await broadcast(latestResult)
                print("✅ Gửi kết quả:",latestResult)
                waitingResult=None
        except Exception as e:
            print("❌ Lỗi đọc dữ liệu:",e)
        await asyncio.sleep(3)

# -------------------------
# Main
# -------------------------
if __name__=="__main__":
    print(f"✅ WebSocket: ws://localhost:{PORT}/ws?id={WS_ID}&key={WS_KEY}")
    print(f"✅ REST API: http://localhost:{PORT}/68gbminhsang")
    loop = asyncio.get_event_loop()
    loop.create_task(fetch_firebase_loop())
    uvicorn.run(app, host="0.0.0.0", port=PORT)
