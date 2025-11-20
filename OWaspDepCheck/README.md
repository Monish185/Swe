🔹 Step 1 — Clean any previous install
pkill -f dependency-check || true
rm -rf ~/depcheck ~/.dependency-check ~/depcheck-data ~/SWE/depcheck-output

🔹 Step 2 — Install required packages
sudo apt update
sudo apt install -y openjdk-21-jdk wget unzip git curl
java -version


If you want Java 17 instead (optional):

sudo apt install -y openjdk-17-jdk

🔹 Step 3 — Download Dependency-Check the correct way
mkdir -p ~/depcheck && cd ~/depcheck
VERSION=$(curl -s https://dependency-check.github.io/DependencyCheck/current.txt)
echo "Latest version: $VERSION"
wget https://github.com/dependency-check/DependencyCheck/releases/download/v${VERSION}/dependency-check-${VERSION}-release.zip -O dep.zip
unzip dep.zip


Check it installed:

~/depcheck/dependency-check/bin/dependency-check.sh --version

🔹 Step 4 — Configure NVD API Key (LOCAL ONLY)

🔑 Enter your key here:

export NVD_API_KEY="259c0ba1-05aa-4387-91cf-5505ac1fd7b6"


👉 Make it permanent (so you don’t export again):

echo 'export NVD_API_KEY="259c0ba1-05aa-4387-91cf-5505ac1fd7b6"' >> ~/.bashrc
source ~/.bashrc

🔹 Step 5 — Fix Java 21 Warnings (Permanent)

Add JVM flags to your bash config:

echo 'export JAVA_TOOL_OPTIONS="--enable-native-access=ALL-UNNAMED --add-modules jdk.incubator.vector -Xmx2g"' >> ~/.bashrc
source ~/.bashrc


📌 These remove annoying warnings and allocate 2GB RAM (safe for local).

🔹 Step 6 — Local NVD DB Update (FAST)
~/depcheck/dependency-check/bin/dependency-check.sh --updateonly --out ~/depcheck-data --nvdApiKey "$NVD_API_KEY"


This might take a few minutes only first time.
After that, it’s cached locally at:

~/.dependency-check/