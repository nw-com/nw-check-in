// 打卡功能相關函數

// 確保state對象存在
if (typeof state === 'undefined') {
    window.state = {};
}

// 設置打卡狀態屬性
if (typeof state.clockInStatus === 'undefined') {
    state.clockInStatus = 'none';
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
        // 根據狀態更新顯示
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

// 打開臨時請假彈窗
function openTempLeaveModal() {
    const modal = document.getElementById('temp-leave-modal');
    const backdrop = document.getElementById('modal-backdrop');
    
    if (!modal || !backdrop) {
        // 如果元素不存在，創建彈窗
        createTempLeaveModal();
        return;
    }
    
    // 清空輸入框
    document.getElementById('leave-reason').value = '';
    document.getElementById('leave-time').value = '';
    
    // 顯示彈窗
    modal.classList.remove('hidden');
    backdrop.classList.remove('hidden');
}

// 創建臨時請假彈窗
function createTempLeaveModal() {
    // 創建背景
    const backdrop = document.createElement('div');
    backdrop.id = 'modal-backdrop';
    backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 z-40';
    backdrop.addEventListener('click', closeAllModals);
    
    // 創建彈窗
    const modal = document.createElement('div');
    modal.id = 'temp-leave-modal';
    modal.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 z-50 w-80';
    
    // 創建標題
    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold mb-4';
    title.textContent = '臨時請假';
    
    // 創建事由輸入框
    const reasonLabel = document.createElement('label');
    reasonLabel.className = 'block text-sm font-medium text-gray-700 mb-1';
    reasonLabel.textContent = '請假事由';
    
    const reasonInput = document.createElement('input');
    reasonInput.id = 'leave-reason';
    reasonInput.type = 'text';
    reasonInput.className = 'w-full border border-gray-300 rounded-md p-2 mb-4';
    reasonInput.placeholder = '例如：看醫生、家庭事務等';
    
    // 創建時間輸入框
    const timeLabel = document.createElement('label');
    timeLabel.className = 'block text-sm font-medium text-gray-700 mb-1';
    timeLabel.textContent = '預計返回時間';
    
    const timeInput = document.createElement('input');
    timeInput.id = 'leave-time';
    timeInput.type = 'datetime-local';
    timeInput.className = 'w-full border border-gray-300 rounded-md p-2 mb-4';
    timeInput.value = formatDatetimeLocal(new Date(Date.now() + 3600000)); // 預設一小時後
    
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
        const reason = document.getElementById('leave-reason').value.trim();
        const time = document.getElementById('leave-time').value;
        
        if (reason && time) {
            saveLeaveRecord(reason, time);
            closeAllModals();
        } else {
            showToast('請填寫完整資訊', true);
        }
    });
    
    // 組裝彈窗
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    modal.appendChild(title);
    modal.appendChild(reasonLabel);
    modal.appendChild(reasonInput);
    modal.appendChild(timeLabel);
    modal.appendChild(timeInput);
    modal.appendChild(buttonContainer);
    
    // 添加到頁面
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
}

// 打開特殊勤務彈窗
function openSpecialDutyModal() {
    const modal = document.getElementById('special-duty-modal');
    const backdrop = document.getElementById('modal-backdrop');
    
    if (!modal || !backdrop) {
        // 如果元素不存在，創建彈窗
        createSpecialDutyModal();
        return;
    }
    
    // 清空輸入框
    document.getElementById('duty-type').value = '';
    
    // 顯示彈窗
    modal.classList.remove('hidden');
    backdrop.classList.remove('hidden');
}

// 創建特殊勤務彈窗
function createSpecialDutyModal() {
    // 創建背景
    const backdrop = document.createElement('div');
    backdrop.id = 'modal-backdrop';
    backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 z-40';
    backdrop.addEventListener('click', closeAllModals);
    
    // 創建彈窗
    const modal = document.createElement('div');
    modal.id = 'special-duty-modal';
    modal.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 z-50 w-80';
    
    // 創建標題
    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold mb-4';
    title.textContent = '特殊勤務';
    
    // 創建勤務類型輸入框
    const typeLabel = document.createElement('label');
    typeLabel.className = 'block text-sm font-medium text-gray-700 mb-1';
    typeLabel.textContent = '勤務類型';
    
    const typeInput = document.createElement('input');
    typeInput.id = 'duty-type';
    typeInput.type = 'text';
    typeInput.className = 'w-full border border-gray-300 rounded-md p-2 mb-4';
    typeInput.placeholder = '例如：加班、值班等';
    
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
        const dutyType = document.getElementById('duty-type').value.trim();
        
        if (dutyType) {
            saveDutyRecord(dutyType);
            closeAllModals();
        } else {
            showToast('請填寫勤務類型', true);
        }
    });
    
    // 組裝彈窗
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    modal.appendChild(title);
    modal.appendChild(typeLabel);
    modal.appendChild(typeInput);
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

// 保存請假記錄
function saveLeaveRecord(reason, returnTime) {
    if (!firebase.auth().currentUser) {
        showToast('用戶未登入', true);
        return;
    }
    
    const userId = firebase.auth().currentUser.uid;
    const timestamp = firebase.firestore.Timestamp.now();
    const returnTimestamp = firebase.firestore.Timestamp.fromDate(new Date(returnTime));
    
    const leaveRecord = {
        userId: userId,
        timestamp: timestamp,
        type: '臨時請假',
        reason: reason,
        returnTime: returnTimestamp,
        status: 'active'
    };
    
    firebase.firestore().collection('leaveRecords').add(leaveRecord)
        .then(() => {
            // 更新用戶狀態
            return firebase.firestore().collection('users').doc(userId).update({
                clockInStatus: '臨時請假',
                lastLeaveTime: timestamp
            });
        })
        .then(() => {
            state.clockInStatus = '臨時請假';
            updateButtonStatus();
            updateStatusDisplay();
            showToast('請假申請已提交', false);
        })
        .catch(error => {
            console.error('保存請假記錄失敗:', error);
            showToast('請假申請失敗', true);
        });
}

// 保存特殊勤務記錄
function saveDutyRecord(dutyType) {
    if (!firebase.auth().currentUser) {
        showToast('用戶未登入', true);
        return;
    }
    
    const userId = firebase.auth().currentUser.uid;
    const timestamp = firebase.firestore.Timestamp.now();
    
    const dutyRecord = {
        userId: userId,
        timestamp: timestamp,
        type: '特殊勤務',
        dutyType: dutyType,
        status: 'active'
    };
    
    firebase.firestore().collection('dutyRecords').add(dutyRecord)
        .then(() => {
            // 更新用戶狀態
            return firebase.firestore().collection('users').doc(userId).update({
                clockInStatus: '特殊勤務',
                lastDutyTime: timestamp
            });
        })
        .then(() => {
            state.clockInStatus = '特殊勤務';
            updateButtonStatus();
            updateStatusDisplay();
            showToast('特殊勤務已登記', false);
        })
        .catch(error => {
            console.error('保存特殊勤務記錄失敗:', error);
            showToast('特殊勤務登記失敗', true);
        });
}

// 格式化日期時間為datetime-local格式
function formatDatetimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// 添加事件監聽器
document.addEventListener('DOMContentLoaded', function() {
    // 外出按鈕
    const outboundButton = document.querySelector('#clock-in-buttons button:nth-child(3)');
    if (outboundButton) {
        outboundButton.addEventListener('click', openLocationInputModal);
    }
    
    // 臨時請假按鈕
    const leaveButton = document.querySelector('#clock-in-buttons button:nth-child(7)');
    if (leaveButton) {
        leaveButton.addEventListener('click', openTempLeaveModal);
    }
    
    // 特殊勤務按鈕
    const dutyButton = document.querySelector('#clock-in-buttons button:nth-child(8)');
    if (dutyButton) {
        dutyButton.addEventListener('click', openSpecialDutyModal);
    }
    
    // 初始化打卡按鈕狀態
    setTimeout(initClockInButtonStatus, 1000);
});