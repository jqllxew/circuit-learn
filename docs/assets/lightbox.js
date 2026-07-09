document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.md-content img').forEach(function(img) {
        if (img.parentElement.tagName === 'A') return;
        var a = document.createElement('a');
        a.href = img.src;
        a.target = '_blank';
        a.title = '点击查看大图';
        img.parentNode.insertBefore(a, img);
        a.appendChild(img);
    });
});
