# Neural Engines & Provider Configuration

The **Recon Command Center** is neural-agnostic, supporting both cloud-scale and local AI models.

## ♊ Google Gemini (Primary)
- **Model**: Gemini-1.5-Flash / Pro.
- **Setup**: Obtain an API Key from [Google AI Studio](https://aistudio.google.com/).
- **Benefit**: Native support for large context feeds and high-speed platform analysis.

## 🌌 OpenAI (GPT-4o)
- **Model**: `gpt-4o`, `gpt-3.5-turbo`.
- **Setup**: Obtain an API Key from the OpenAI Dashboard.
- **Benefit**: Exceptional narrative stability for agent cover identities.

## 🦙 Local Ollama (Standalone)
- **Model**: `llama3`, `mistral`, `codellama`.
- **Setup**: Install [Ollama](https://ollama.com/) and run the model locally.
- **Endpoint**: Default is `http://localhost:11434`.
- **Benefit**: Full privacy, zero cost, and secure local execution.

### ✅ Synchronization Check
The **Neural Sync Visualizer** in the Sidebar will pulse blue when your chosen provider is successfully processing platform signals.
