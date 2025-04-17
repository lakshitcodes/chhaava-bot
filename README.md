# 🤖 ChhavaBot – RAG WhatsApp Chatbot

ChhavaBot is a **Retrieval-Augmented Generation (RAG)** powered WhatsApp chatbot designed to deliver real-time, intelligent, and context-aware interactions. Built with a streamlined tech stack, it automates core services like car service bookings, test drive scheduling, and emergency assistance — all through WhatsApp.

## 🚀 Tech Stack

- **Flask** – Lightweight Python web framework for API and backend logic  
- **Baileys.js** – WhatsApp Web API for sending/receiving messages  
- **Groq** – High-performance inference engine powering fast and context-rich LLM responses  

## 🔧 Key Features

- **🔍 RAG-Powered Intelligence**  
  Combines LLMs with retrieval capabilities to deliver accurate, up-to-date answers based on real-world data.

- **📅 Service Booking Automation**  
  Effortlessly schedule car service appointments through a simple WhatsApp chat.

- **🚗 Test Drive Scheduling**  
  Users can easily book test drives with real-time confirmations.

- **🚨 Emergency Assistance**  
  Provides instant support for roadside emergencies or technical help.

- **💬 Real-Time WhatsApp Integration**  
  Seamless 2-way interaction using Baileys.js with persistent context and user tracking.

## ⚙️ How It Works

1. **User initiates a conversation on WhatsApp.**  
2. **Baileys.js** receives and forwards the message to a **Flask API**.  
3. **Flask** handles the message logic and queries relevant data via RAG using **Groq**.  
4. The chatbot sends back a tailored, human-like response in real time.

## 🛠️ Getting Started

> Coming soon: Detailed setup guide, deployment instructions, and API documentation.

In the meantime, make sure you have:
- A working WhatsApp number/session
- Python & Node.js installed
- Access to a Groq-compatible model

Built with ❤️ for seamless automotive support and smarter customer experiences.
