#!/bin/bash
# Debian 12
# 
# ---------

domain="vegameta.ru"
repository="https://github.com/vegameta/FASTAPI_TG_SCRAPER.git"
echo "export DOMAIN=$domain" | sudo tee -a /etc/profile
set -Ux DOMAIN $domain

sudo apt update -y
sudo apt upgrade -y
sudo apt-get update -y
sudo apt-get install -y libssl-dev openssl
echo iptables-persistent iptables-persistent/autosave_v4 boolean true | sudo debconf-set-selections
echo iptables-persistent iptables-persistent/autosave_v6 boolean true | sudo debconf-set-selections
sudo apt install -y python-is-python3 python3.11-venv knockd tmux zsh mc vim git iptables-persistent certbot unrar-free 7zip

# Docker
# sudo apt remove -y docker docker-engine docker.io containerd runc
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo tee /etc/apt/keyrings/docker.asc > /dev/null
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update -y
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo apt autoremove -y

sudo usermod -aG docker $USER
newgrp docker

sudo systemctl start docker
sudo systemctl enable docker
sudo systemctl restart docker
# -------

# port-knocking
adapter=$(ip -o -4 route show to default | awk '{print $5}')
port=22
echo "Port $port
PermitRootLogin no
PasswordAuthentication no
AllowUsers vegameta" | sudo tee -a /etc/ssh/sshd_config

echo "
127.0.1.1   $(hostname)
" | sudo tee -a /etc/hosts

echo "[options]
    UseSyslog
    Interface 		= $adapter

[SSH]
    sequence        = 43333,45555,44444
    seq_timeout     = 9
    tcpflags        = syn
    start_command   = /sbin/iptables -I INPUT -s %IP% -p tcp --dport $port -j ACCEPT
    stop_command    = /sbin/iptables -D INPUT -s %IP% -p tcp --dport $port -j ACCEPT
    cmd_timeout     = 25" | sudo tee /etc/knockd.conf

echo "START_KNOCKD=1
KNOCKD_OPTS="-i $adapter"" | sudo tee /etc/default/knockd

sudo service ssh restart
# sudo systemctl reset-failed ssh
sudo systemctl start knockd
sudo systemctl enable knockd
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
sudo iptables -A INPUT -p tcp --dport $port -j REJECT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p icmp --icmp-type 8 -m limit --limit 1/s -j ACCEPT
sudo iptables -A INPUT -j DROP
sudo service netfilter-persistent save
sudo /etc/init.d/networking restart
sudo systemctl restart systemd-networkd
sudo systemctl restart NetworkManager
# -------

# shell
echo "auth      sufficient      pam_shells.so
auth      sufficient      pam_rootok.so
@include common-auth
@include common-account
@include common-session" | sudo tee /etc/pam.d/chsh > /dev/null

echo "set-option -g default-shell /bin/zsh" | sudo tee ~/.tmux.conf
chsh -s /usr/bin/tmux
sh -c "$(wget https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)" "" --unattended
# -------


# tsl

domain="vegameta.ru"
sudo certbot certonly --standalone -d $domain -d www.$domain
echo "0 3 * * * certbot renew --quiet" | sudo crontab -
cert_path="/etc/letsencrypt/live/$domain/fullchain.pem"
key_path="/etc/letsencrypt/live/$domain/privkey.pem"
set -Ux CERT_PATH $cert_path
set -Ux KEY_PATH $key_path
# -------

# ssh key
ssh-keygen -t ed25519 -q -N "" -f ~/.ssh/id_ed25519
clear
cat ~/.ssh/id_ed25519.pub
# -------

read

# repo

repository="git@github.com:VEGAMETA/FASTAPI_TG_SCRAPER.git"
cd ~/
mkdir ./app
git clone $repository ./app
cd ./app
python -m venv venv
./venv/bin/pip install -r requirements.txt

sudo setcap 'cap_net_bind_service=+ep' $(which uvicorn)
chmod +x ./run
# ----

