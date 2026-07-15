// 图片点击弹出模态框查看大图，不跳新页面
document.addEventListener('DOMContentLoaded', function () {
    var modal = document.createElement('div');
    modal.id = 'lb-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9999;display:none;align-items:center;justify-content:center;cursor:pointer';
    modal.onclick = function () { modal.style.display = 'none'; };

    var img = document.createElement('img');
    img.style.cssText = 'max-width:95vw;max-height:95vh;object-fit:contain;box-shadow:0 0 40px rgba(0,0,0,0.5)';
    img.onclick = function (e) { e.stopPropagation(); };
    modal.appendChild(img);
    document.body.appendChild(modal);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') modal.style.display = 'none';
    });

    document.querySelectorAll('article img, .md-content img').forEach(function (pic) {
        var src = pic.src;
        pic.style.cursor = 'zoom-in';
        pic.title = '点击放大';
        pic.onclick = function () {
            img.src = src;
            modal.style.display = 'flex';
        };
    });
});
