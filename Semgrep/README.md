🧩 Option 1: (Recommended) Install with a Virtual Environment 
# 1️⃣ Make sure Python and venv are installed sudo apt install python3-full python3-venv -y 
# 2️⃣ Create a virtual environment python3 -m venv ~/.semgrep-env 
# 3️⃣ Activate it source ~/.semgrep-env/bin/activate 
# 4️⃣ Install Semgrep inside it pip install semgrep 
# 5️⃣ Verify semgrep --version ✅ You’re done — every time you want to use Semgrep, just run: source ~/.semgrep-env/bin/activate semgrep --config auto . If you want it globally available, you can add an alias: echo 'alias semgrep="~/.semgrep-env/bin/semgrep"' >> ~/.bashrc source ~/.bashrc