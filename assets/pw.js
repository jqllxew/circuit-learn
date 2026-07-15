// 简单的密码门 - 密码: circuit
(function() {
  if (sessionStorage.getItem('pw_ok') === '1') return;
  var gate = document.createElement('div');
  gate.id = 'pw-gate';
  gate.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#1a1a2e;color:#e0e0e0"><div style="text-align:center"><h2>🔒 电路学习笔记</h2><input id="pw-input" type="password" placeholder="输入密码" style="padding:8px 16px;font-size:16px;border-radius:4px;border:none;margin-top:8px"><br><button onclick="(function(){var p=document.getElementById(\'pw-input\').value;if(p===\'circuit\'){sessionStorage.setItem(\'pw_ok\',\'1\');document.getElementById(\'pw-gate\').remove()}else{document.getElementById(\'pw-msg\').textContent=\'密码不对哦～\'}})()" style="margin-top:12px;padding:8px 24px;font-size:14px;border:none;border-radius:4px;background:#4a6cf7;color:white;cursor:pointer">进入</button><p id="pw-msg" style="color:#f55;margin-top:8px;font-size:13px"></p></div></div>';
  gate.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999';
  document.documentElement.appendChild(gate);
})();
