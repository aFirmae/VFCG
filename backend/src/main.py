from fastapi import FastAPI, Request, Form
import logging
import uvicorn

logging.basicConfig(level=logging.INFO)

app = FastAPI()

# Allow CORS from the frontend dev server
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Hello from FastAPI backend"}

@app.post("/")
async def receive_message(request: Request, message: str = Form(None)):
    if message is None:
        try:
            data = await request.json()
            message = data.get("message")
        except Exception:
            form = await request.form()
            message = form.get("message")

    logging.info("Received message: %s", message)
    print(f"Received message: {message}")
    return {"status": "received", "message": message}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5050)