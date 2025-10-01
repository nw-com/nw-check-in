// 打卡功能相關函數

// 確保state對象存在
if (typeof state === 'undefined') {
    window.state = {};
}

// 設置打卡狀態屬性
if (typeof state.clockInStatus === 'undefined') {
    state.clockInStatus = 'none';
}

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

// 更新狀態顯示
function updateStatusDisplay() {
    // 檢查狀態顯示區域是否存在，如果不存在則創建
    let statusDisplay = document.getElementById('status-display');
    if (!statusDisplay) {
        const clockInContainer = document.getElementById('clock-in-container');
        const clockInButtons = document.getElementById('clock-in-buttons');
        
        if (!clockInContainer || !clockInButtons) return;
        
        statusDisplay = document.createElement('div');
        statusDisplay.id = 'status-display';
        statusDisplay.className = 'mb-4 p-3 rounded-lg text-center';
        
        const statusText = document.createElement('span');
        statusText.id = 'status-text';
        statusText.textContent = '尚未打卡';
        statusDisplay.appendChild(statusText);
        
        clockInContainer.insertBefore(statusDisplay, clockInButtons);
    }
    
    // 更新儀表板狀態
    updateDashboardStatus();
    
    // 更新打卡狀態顯示
    const statusText = document.getElementById('status-text');
    if (statusText) {
        // 強制檢查當前用戶的打卡狀態
        if (firebase.auth().currentUser) {
            const userId = firebase.auth().currentUser.uid;
            firebase.firestore().collection('users').doc(userId).get().then(doc => {
                if (doc.exists && doc.data().clockInStatus) {
                    state.clockInStatus = doc.data().clockInStatus;
                    state.outboundLocation = doc.data().outboundLocation || null;
                }
                
                // 根據狀態更新顯示
                updateStatusTextAndStyle(statusText, statusDisplay);
            }).catch(error => {
                console.error("獲取用戶狀態失敗:", error);
                updateStatusTextAndStyle(statusText, statusDisplay);
            });
        } else {
            updateStatusTextAndStyle(statusText, statusDisplay);
        }
    }
}

// 更新儀表板狀態
function updateDashboardStatus() {
    const dashboardStatusElement = document.getElementById('my-status');
    if (dashboardStatusElement) {
        let statusText = '';
        switch(state.clockInStatus) {
            case '上班':
                statusText = '上班中-辦公室';
                break;
            case '下班':
                statusText = '已下班';
                break;
            case '外出':
                statusText = '外出中';
                if (state.outboundLocation) {
                    statusText += `-${state.outboundLocation}`;
                }
                break;
            case '抵達':
                statusText = '抵達';
                if (state.outboundLocation) {
                    statusText += `-${state.outboundLocation}`;
                }
                break;
            case '離開':
                statusText = '離開';
                if (state.outboundLocation) {
                    statusText += `-${state.outboundLocation}`;
                }
                break;
            case '返回':
                statusText = '上班中-辦公室';
                break;
            default:
                statusText = '尚未打卡';
        }
        dashboardStatusElement.textContent = statusText;
    }
}

// 初始化打卡按鈕狀態
function initClockInButtonStatus() {
    // 檢查用戶是否已登入
    if (!firebase.auth().currentUser) {
        console.log("用戶尚未登入，無法初始化打卡按鈕");
        setTimeout(initClockInButtonStatus, 1000); // 延遲重試
        return;
    }
    
    // 獲取當前用戶ID
    const userId = firebase.auth().currentUser.uid;
    
    // 禁用所有按鈕，等待狀態確認
    document.querySelectorAll('#clock-in-buttons button').forEach(button => {
        button.disabled = true;
        button.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        button.classList.add('bg-gray-300', 'cursor-not-allowed');
    });
    
    // 從Firestore獲取用戶最後的打卡狀態
    firebase.firestore().collection('users').doc(userId).get().then(doc => {
        if (doc.exists && doc.data().clockInStatus) {
            // 設置全局狀態
            state.clockInStatus = doc.data().clockInStatus;
            state.outboundLocation = doc.data().outboundLocation || null;
            
            // 更新按鈕狀態
            updateButtonStatus();
        } else {
            // 新用戶，只啟用上班打卡
            state.clockInStatus = 'none';
            state.outboundLocation = null;
            enableOnlyButton('上班');
        }
        
        // 更新狀態顯示
        updateStatusDisplay();
    }).catch(error => {
        console.error("獲取用戶狀態失敗:", error);
        showToast("獲取用戶狀態失敗，請重新整理頁面", true);
    });
}

// 更新按鈕狀態
function updateButtonStatus() {
    // 先禁用所有按鈕
    document.querySelectorAll('#clock-in-buttons button').forEach(button => {
        button.disabled = true;
        button.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        button.classList.add('bg-gray-300', 'cursor-not-allowed');
    });
    
    // 根據當前狀態啟用相應按鈕
    switch(state.clockInStatus) {
        case 'none':
            // 尚未打卡，只啟用上班按鈕
            enableOnlyButton('上班');
            break;
        case '上班':
            // 已上班，啟用下班和外出按鈕
            enableButton('下班');
            enableButton('外出');
            enableButton('臨時請假');
            enableButton('特殊勤務');
            break;
        case '下班':
            // 已下班，只啟用上班按鈕
            enableOnlyButton('上班');
            break;
        case '外出':
            // 外出中，啟用抵達按鈕
            enableOnlyButton('抵達');
            break;
        case '抵達':
            // 已抵達，啟用離開按鈕
            enableOnlyButton('離開');
            break;
        case '離開':
            // 已離開，啟用返回按鈕
            enableOnlyButton('返回');
            break;
        case '返回':
            // 已返回，啟用下班和外出按鈕
            enableButton('下班');
            enableButton('外出');
            enableButton('臨時請假');
            enableButton('特殊勤務');
            break;
        case '臨時請假':
            // 臨時請假中，不啟用任何按鈕
            break;
        case '特殊勤務':
            // 特殊勤務中，不啟用任何按鈕
            break;
        default:
            // 未知狀態，只啟用上班按鈕
            enableOnlyButton('上班');
    }
    
    // 更新狀態顯示
    updateStatusDisplay();
}

// 啟用指定按鈕
function enableButton(buttonText) {
    const button = Array.from(document.querySelectorAll('#clock-in-buttons button')).find(btn => btn.textContent.trim() === buttonText);
    if (button) {
        button.disabled = false;
        button.classList.remove('bg-gray-300', 'cursor-not-allowed');
        button.classList.add('bg-blue-500', 'hover:bg-blue-600');
    }
}

// 只啟用指定按鈕，禁用其他所有按鈕
function enableOnlyButton(buttonText) {
    document.querySelectorAll('#clock-in-buttons button').forEach(button => {
        if (button.textContent.trim() === buttonText) {
            button.disabled = false;
            button.classList.remove('bg-gray-300', 'cursor-not-allowed');
            button.classList.add('bg-blue-500', 'hover:bg-blue-600');
        } else {
            button.disabled = true;
            button.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            button.classList.add('bg-gray-300', 'cursor-not-allowed');
        }
    });
}

// 打開外出地點輸入彈窗
function openLocationInputModal() {
    const modal = document.getElementById('location-input-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const locationInput = document.getElementById('outbound-location');
    
    if (!modal || !backdrop || !locationInput) {
        // 如果元素不存在，創建彈窗
        createLocationInputModal();
        return;
    }
    
    // 清空輸入框
    locationInput.value = '';
    
    // 顯示彈窗
    modal.classList.remove('hidden');
    backdrop.classList.remove('hidden');
}

// 創建外出地點輸入彈窗
function createLocationInputModal() {
    // 創建背景
    const backdrop = document.createElement('div');
    backdrop.id = 'modal-backdrop';
    backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 z-40';
    backdrop.addEventListener('click', closeAllModals);
    
    // 創建彈窗
    const modal = document.createElement('div');
    modal.id = 'location-input-modal';
    modal.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 z-50 w-80';
    
    // 創建標題
    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold mb-4';
    title.textContent = '請輸入外出地點';
    
    // 創建輸入框
    const input = document.createElement('input');
    input.id = 'outbound-location';
    input.type = 'text';
    input.className = 'w-full border border-gray-300 rounded-md p-2 mb-4';
    input.placeholder = '例如：客戶公司、醫院等';
    
    // 創建按鈕容器
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex justify-end space-x-2';
    
    // 創建取消按鈕
    const cancelButton = document.createElement('button');
    cancelButton.className = 'px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300';
    cancelButton.textContent = '取消';
    cancelButton.addEventListener('click', closeAllModals);
    
    // 創建確認按鈕
    const confirmButton = document.createElement('button');
    confirmButton.className = 'px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600';
    confirmButton.textContent = '確認';
    confirmButton.addEventListener('click', () => {
        const location = document.getElementById('outbound-location').value.trim();
        if (location) {
            state.outboundLocation = location;
            closeAllModals();
            openCameraModal('外出');
        } else {
            showToast('請輸入外出地點', true);
        }
    });
    
    // 組裝彈窗
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    modal.appendChild(title);
    modal.appendChild(input);
    modal.appendChild(buttonContainer);
    
    // 添加到頁面
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
}

// 關閉所有彈窗
function closeAllModals() {
    const backdrop = document.getElementById('modal-backdrop');
    const locationModal = document.getElementById('location-input-modal');
    const leaveModal = document.getElementById('temp-leave-modal');
    const dutyModal = document.getElementById('special-duty-modal');
    
    if (backdrop) backdrop.classList.add('hidden');
    if (locationModal) locationModal.classList.add('hidden');
    if (leaveModal) leaveModal.classList.add('hidden');
    if (dutyModal) dutyModal.classList.add('hidden');
}

// 添加事件監聽器
document.addEventListener('DOMContentLoaded', function() {
    // 外出按鈕
    const outboundButton = document.querySelector('#clock-in-buttons button:nth-child(3)');
    if (outboundButton) {
        outboundButton.addEventListener('click', openLocationInputModal);
    }
    
    // 初始化打卡按鈕狀態
    setTimeout(initClockInButtonStatus, 1000);
});