const fs = require('fs');
let content = fs.readFileSync('src/modules/user/user.controller.js', 'utf8');
content = content.replace('export const getUsers', 'export const getUserCount = async (req, res) => {\\n  try {\\n    const count = await User.countDocuments();\\n    res.json({ count });\\n  } catch (error) {\\n    res.status(500).json({ message: "Lỗi server" });\\n  }\\n};\\n\\nexport const getUsers');
fs.writeFileSync('src/modules/user/user.controller.js', content);
