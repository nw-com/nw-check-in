// 根據狀態更新顯示文本和樣式
function updateStatusTextAndStyle(statusText, statusDisplay) {
    switch(state.clockInStatus) {
        case '上班':
            statusText.textContent = '上班中-辦公室';
            statusDisplay.className = 'mb-4 p-3 rounded-lg text-center bg-green-100 text-green-800';
            break;
        case '下班':
            statusText.textContent = '已下班';
            statusDisplay.className = 'mb-4 p-3 rounded-lg text-center bg-gray-100 text-gray-800';
            break;
        case '外出':
            statusText.textContent = '外出中';
            statusDisplay.className = 'mb-4 p-3 rounded-lg text-center bg-blue-100 text-blue-800';
            break;
        case '抵達':
            statusText.textContent = '抵達';
            statusDisplay.className = 'mb-4 p-3 rounded-lg text-center bg-purple-100 text-purple-800';
            break;
        case '離開':
            statusText.textContent = '離開';
            statusDisplay.className = 'mb-4 p-3 rounded-lg text-center bg-yellow-100 text-yellow-800';
            break;
        case '返回':
            statusText.textContent = '上班中-辦公室';
            statusDisplay.className = 'mb-4 p-3 rounded-lg text-center bg-green-100 text-green-800';
            break;
        default:
            statusText.textContent = '尚未打卡';
            statusDisplay.className = 'mb-4 p-3 rounded-lg text-center bg-gray-100 text-gray-800';
    }
}