from fastapi import FastAPI, HTTPException, Request
import uvicorn

app = FastAPI()

@app.post("/send-data")
async def receive_data(request: Request):
    data = await request.json()
    print("Received data:", data)
    return {"message": "Data received successfully"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)


# uvicorn main:app --reload --host 0.0.0.0
# pip install fastapi uvicorn
