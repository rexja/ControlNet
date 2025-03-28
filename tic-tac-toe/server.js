const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

// 提供靜態文件
app.use(express.static(path.join(__dirname)));

// 啟動服務器
app.listen(PORT, () => {
  console.log(`井字遊戲服務器運行在 http://localhost:${PORT}`);
  console.log(`您可以使用瀏覽器訪問上述網址來打開遊戲`);
});
