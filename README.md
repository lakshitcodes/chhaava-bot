# 🤖 ChhavaBot: RAG WhatsApp Chatbot

ChhavaBot is an AI-powered WhatsApp chatbot built to automate car service bookings, test drives, and emergency assistance. Utilizing Retrieval-Augmented Generation (RAG), it delivers context-aware and real-time responses for a seamless customer experience.

---

## 📚 Table of Contents
- Project Overview
- Features
- Tech Stack
- Architecture Overview
- WhatsApp & Baileys.js Setup
- Running ChhavaBot Locally
- Screenshots
- License

---

## 📌 Project Overview

ChhavaBot simplifies the interaction between users and automotive service providers through an intelligent WhatsApp interface. The chatbot offers responsive, smart, and secure communication using the RAG pipeline powered by Groq.

---

## 👥 User Roles

- **Customer**: Interacts via WhatsApp to request services, book test drives, or seek help.
- **Admin/Operator** *(optional)*: Can view service logs or intervene when necessary (future roadmap feature).

---

## 🧠 Core Functionalities

- **Real-Time Conversations**: Handles incoming WhatsApp messages using Baileys.js.
- **RAG-based Responses**: Fetches relevant context and uses a language model for precise and conversational replies.
- **Car Service Booking**: Users can schedule maintenance and general services.
- **Test Drive Scheduling**: Book a test drive directly from WhatsApp with confirmation messages.
- **Emergency Assistance**: Instantly triggers help for breakdowns or urgent support.
- **Session Context**: Keeps short-term memory to maintain context during chats.

---

## 🧰 Tech Stack

- **Flask** – Backend framework for routing, processing, and response handling.
- **Baileys.js** – WhatsApp Web API wrapper for Node.js to send and receive messages.
- **Groq** – High-speed inference engine for powering RAG and LLM responses.
- **SQLite/MySQL** – (Optional) For logging conversations and booking history.

---

## 🏗️ Architecture Overview

```txt
[WhatsApp User] <--> [Baileys.js] <--> [Flask API] <--> [RAG Engine (Groq)] <--> [Response]
                                              |
                                              +--> [Database (Bookings, Logs)]
```
## 🔧 WhatsApp & Baileys.js Setup

ChhavaBot uses **Baileys.js** to interface with WhatsApp Web and handle message sending and receiving. Follow the steps below to configure it:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/chhavabot.git
cd chhavabot
```
### 2. Navigate to WhatsApp Handler
```bash
cd whatsapp-handler
```
### 3. Install Node.js Dependencies
```bash
npm install
```
### 4. Start WhatsApp Session
```bash
node index.js
```
📱 Scan the QR code using WhatsApp:

Open WhatsApp > Settings > Linked Devices > Link a Device


---

## 🚀 Running ChhavaBot Locally

Make sure you have **Python 3.8+** and **Node.js** installed.

### 1. Install Python dependencies

```bash
pip install -r requirements.txt
```
### 2. Start the Flask backend
```bash
python app.py
```
### 3. Start the WhatsApp handler
In a separate terminal:
```bash
cd whatsapp-handler
node index.js
```
## 🖼️ Screenshots

Built with 🧠 and ❤️ to revolutionize car service experiences using AI.
