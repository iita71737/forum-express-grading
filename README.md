# README

## 初始化
### Initialize
```
git clone https://github.com/your_github_name/forum-express-2020
cd forum-express
git remote add upstream https://github.com/ALPHACamp/forum-express-2020.git  # 建立上游連線
npm install
```

### 設定資料庫
需要與 config/config.json 一致

```
create database forum;
```

### 執行測試
```
npm run test
```

## 下載作業規格
以 R01 為例

```
git checkout -b R01           # 開新分支
git merge origin/R01-test     # 下載作業規格
npm run test                  # 直到綠燈全亮

git add .
git commit -m "...."
```

## 繳交作業
<<<<<<< HEAD

```
git push origin A17           # 上傳本地進度
```

接著改成到 GitHub 來發 PR。

## 共用帳號
請一律設定一個共用的 root user
root@example.com，登入密碼 12345678

myheroku-name: limitless-bastion-42149
=======

```
git push origin R01           # 上傳本地進度
```

接著改成到 GitHub 來發 PR。

## 共用帳號
<<<<<<< HEAD
請一律設定一個共用的 root user
root@example.com，登入密碼 12345678
>>>>>>> origin/A17-test
=======
請一律設定下面 2 組帳號以利驗收：
* 第一組帳號有 admin 權限：
  * email: root@example.com
  * password: 12345678
* 第二組帳號沒有 admin 權限：
  * email: user1@example.com
  * password: 12345678
>>>>>>> origin/R01-test
