// 添加输入事件监听器
document.getElementById('jsonInput').addEventListener('input', debounce(formatJSON, 300));

// 防抖函数，避免频繁解析
function debounce(func, wait) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

function formatJSON() {
    const input = document.getElementById('jsonInput').value.trim();
    const output = document.getElementById('jsonOutput');

    // 如果输入为空，清空输出
    if (!input) {
        output.textContent = '';
        output.classList.remove('error');
        return;
    }

    try {
        // 解析输入的 JSON 字符串
        const parsedData = JSON.parse(input);
        output.innerHTML = syntaxHighlight(parsedData);
        output.classList.remove('error');
    } catch (error) {
        // 如果解析出错，显示错误信息
        output.textContent = '错误：无效的 JSON 格式\n' + error.message;
        output.classList.add('error');
    }
}

function syntaxHighlight(obj) {
    const json = JSON.stringify(obj, null, 4);
    let result = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'number';
        let type = '';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
                // 移除结尾的冒号用于显示
                match = match.slice(0, -1);
                type = '';
            } else {
                cls = 'string';
                type = '<span class="type">String</span>';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
            type = '<span class="type">Boolean</span>';
        } else if (/null/.test(match)) {
            cls = 'null';
            type = '<span class="type">Null</span>';
        } else {
            type = '<span class="type">Number</span>';
        }

        // 为键名添加冒号
        const suffix = cls === 'key' ? '<span class="colon">:</span>' : '';
        return `<span class="${cls}">${match}</span>${type}${suffix}`;
    });

    // 添加数组和对象的类型标识
    result = result.replace(/\{/g, '{<span class="type">Object</span>');
    result = result.replace(/\[/g, '[<span class="type">Array</span>');

    return result;
}

// 添加复制功能
document.getElementById('copyButton').addEventListener('click', async function () {
    const output = document.getElementById('jsonOutput');
    const button = this;

    try {
        // 创建一个临时元素来获取纯文本内容
        const temp = document.createElement('div');
        temp.innerHTML = output.innerHTML;

        // 提取所有文本内容，移除类型标签
        const textContent = Array.from(temp.childNodes)
            .map(node => {
                if (node.nodeType === 3) return node.textContent; // 文本节点
                if (node.classList?.contains('type')) return ''; // 跳过类型标签
                if (node.classList?.contains('colon')) return ':'; // 处理冒号
                return node.textContent;
            })
            .join('');

        // 复制格式化后的文本
        await navigator.clipboard.writeText(textContent);

        // 显示成功状态
        button.classList.add('success');
        const originalText = button.innerHTML;
        button.innerHTML = `
            <svg class="copy-icon" viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            已复制
        `;

        // 3秒后恢复原始状态
        setTimeout(() => {
            button.classList.remove('success');
            button.innerHTML = originalText;
        }, 3000);
    } catch (err) {
        console.error('复制失败:', err);

        // 显示错误状态
        button.classList.add('error');
        const originalText = button.innerHTML;
        button.innerHTML = `
            <svg class="copy-icon" viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            复制失败
        `;

        setTimeout(() => {
            button.classList.remove('error');
            button.innerHTML = originalText;
        }, 3000);
    }
}); 