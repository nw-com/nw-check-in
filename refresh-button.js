// 刷新按鈕事件監聽
document.addEventListener('DOMContentLoaded', function() {
    const refreshBtn = document.getElementById('refresh-status-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            const usersStatusList = document.getElementById('users-status-list');
            
            // 顯示加載動畫
            usersStatusList.innerHTML = `
                <div class="animate-pulse flex space-x-4 items-center">
                    <div class="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div class="flex-1 space-y-2 py-1">
                        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
                <div class="animate-pulse flex space-x-4 items-center">
                    <div class="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div class="flex-1 space-y-2 py-1">
                        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            `;
            
            // 顯示按鈕加載狀態
            toggleButtonLoading(refreshBtn, true);
            
            // 獲取所有用戶
            const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
            getDocs(usersQuery).then((snapshot) => {
                const users = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user => user.status !== 'deleted');
                
                // 獲取所有用戶後，顯示他們的狀態
                fetchAllUsersStatus(users);
                
                // 恢復按鈕狀態
                toggleButtonLoading(refreshBtn, false);
            }).catch((error) => {
                console.error("獲取用戶列表失敗:", error);
                usersStatusList.innerHTML = `<p class="text-red-500 text-center py-4">無法載入用戶列表。${error.message}</p>`;
                toggleButtonLoading(refreshBtn, false);
            });
        });
    }
});