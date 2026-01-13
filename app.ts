// 定义数据类型
interface WeekInfo {
    start_week: number;
    end_week: number;
    week_type: string | null;
}

interface TimeSlot {
    day_of_week: number;
    periods: number[];
}

interface ParsedTimeLocation {
    week_info: WeekInfo;
    campus: number;
    time_slots: TimeSlot[];
}

interface ClassNumberGroup {
    class_number_group_id: number;
    course_number: string;
    class_numbers: string[];
    course_name: string;
    credit: number;
    assessment_method: string;
    parsed_time_location: ParsedTimeLocation[];
}

// 声明全局变量
declare const infoCreateTime: string;
declare const classInfo: any[];
declare const groupInfo: ClassNumberGroup[];

// 应用类
class CourseGroupApp {
    private searchResultsContainer: HTMLElement;
    private selectedGroupsContainer: HTMLElement;
    private courseNumberInput: HTMLInputElement;
    private courseNameInput: HTMLInputElement;
    private groupIdInput: HTMLInputElement;
    private searchBtn: HTMLButtonElement;
    private clearBtn: HTMLButtonElement;
    private selectedGroupIds: Set<number>;
    
    // 弹窗相关元素
    private modal: HTMLElement;
    private closeBtn: HTMLElement;
    private modalCourseName: HTMLElement;
    private modalCourseInfo: HTMLElement;
    private courseSchedule: HTMLTableElement;

    constructor() {
        // 初始化DOM元素
        this.searchResultsContainer = document.getElementById('search-results')!;
        this.selectedGroupsContainer = document.getElementById('selected-groups')!;
        this.courseNumberInput = document.getElementById('course-number') as HTMLInputElement;
        this.courseNameInput = document.getElementById('course-name') as HTMLInputElement;
        this.groupIdInput = document.getElementById('group-id') as HTMLInputElement;
        this.searchBtn = document.getElementById('search-btn') as HTMLButtonElement;
        this.clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
        
        // 初始化弹窗元素
        this.modal = document.getElementById('group-details-modal')!;
        this.closeBtn = document.querySelector('.close')!;
        this.modalCourseName = document.getElementById('modal-course-name')!;
        this.modalCourseInfo = document.getElementById('modal-course-info')!;
        this.courseSchedule = document.getElementById('course-schedule') as HTMLTableElement;
        
        // 初始化已选课程组ID集合
        this.selectedGroupIds = this.loadSelectedGroupsFromStorage();

        // 绑定事件
        this.bindEvents();

        // 初始化应用
        this.init();
    }

    private bindEvents(): void {
        // 搜索按钮事件
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        
        // 清除按钮事件
        this.clearBtn.addEventListener('click', () => this.handleClear());
        
        // 回车键搜索
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
        
        // 弹窗关闭事件
        this.closeBtn.addEventListener('click', () => this.closeModal());
        
        // 点击弹窗外部区域关闭弹窗
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    private init(): void {
        // 初始化应用
        this.updateSelectedGroupsDisplay();
    }

    // 从localStorage加载已选课程组
    private loadSelectedGroupsFromStorage(): Set<number> {
        const stored = localStorage.getItem('selectedCourseGroups');
        if (stored) {
            try {
                return new Set(JSON.parse(stored).map(Number));
            } catch (e) {
                console.error('Failed to parse selected groups from localStorage:', e);
                return new Set();
            }
        }
        return new Set();
    }

    // 将已选课程组保存到localStorage
    private saveSelectedGroupsToStorage(): void {
        localStorage.setItem('selectedCourseGroups', JSON.stringify(Array.from(this.selectedGroupIds)));
    }

    // 处理复选框变更
    private handleCheckboxChange(groupId: number, isChecked: boolean): void {
        if (isChecked) {
            this.selectedGroupIds.add(groupId);
        } else {
            this.selectedGroupIds.delete(groupId);
        }
        
        // 保存到localStorage
        this.saveSelectedGroupsToStorage();
        
        // 更新已选课程组显示
        this.updateSelectedGroupsDisplay();
    }

    // 更新已选课程组显示
    private updateSelectedGroupsDisplay(): void {
        if (this.selectedGroupIds.size === 0) {
            this.selectedGroupsContainer.innerHTML = '<p class="no-selections">暂无选择的课程组</p>';
            return;
        }

        // 获取已选课程组的详细信息
        const selectedGroups = Array.from(this.selectedGroupIds)
            .map(id => groupInfo.find(group => group.class_number_group_id === id))
            .filter((group): group is ClassNumberGroup => group !== undefined);

        // 渲染已选课程组
        this.selectedGroupsContainer.innerHTML = selectedGroups.map(group => `
            <div class="selected-group-item" data-group-id="${group.class_number_group_id}">
                <span class="group-info">
                    ${group.course_name} (ID: ${group.class_number_group_id})<br>
                    <small>课程编号: ${group.course_number} | 课堂编号: ${group.class_numbers.join(',')}</small>
                </span>
                <button class="remove-btn" data-group-id="${group.class_number_group_id}">
                    ×
                </button>
            </div>
        `).join('');

        // 为已选课程组卡片添加点击事件
        this.selectedGroupsContainer.querySelectorAll('.selected-group-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // 如果点击的是删除按钮，不打开弹窗
                if ((e.target as HTMLElement).classList.contains('remove-btn')) {
                    return;
                }
                
                const groupId = parseInt((item as HTMLElement).dataset.groupId!);
                this.openGroupDetails(groupId);
            });
        });

        // 绑定删除按钮事件
        this.selectedGroupsContainer.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const groupId = parseInt((e.target as HTMLElement).dataset.groupId!);
                this.handleCheckboxChange(groupId, false);
                
                // 更新搜索结果中对应课程组的复选框状态
                const checkbox = document.querySelector(`input[type="checkbox"][data-group-id="${groupId}"]`) as HTMLInputElement;
                if (checkbox) {
                    checkbox.checked = false;
                }
            });
        });
    }

    // 打开课程组详情弹窗
    private openGroupDetails(groupId: number): void {
        // 查找课程组信息
        const group = groupInfo.find(g => g.class_number_group_id === groupId);
        if (!group) return;

        // 设置弹窗标题和课程信息
        this.modalCourseName.textContent = `${group.course_name} (ID: ${group.class_number_group_id})`;
        this.modalCourseInfo.innerHTML = `
            <p><strong>课程编号:</strong> ${group.course_number}</p>
            <p><strong>课堂编号:</strong> ${group.class_numbers.join(',')}</p>
            <p><strong>学分:</strong> ${group.credit}</p>
            <p><strong>考核方式:</strong> ${group.assessment_method}</p>
            <p><strong>周次:</strong> ${this.formatWeekInfo(group.parsed_time_location[0].week_info)}</p>
            <p><strong>校区:</strong> ${this.formatCampus(group.parsed_time_location[0].campus)}</p>
        `;

        // 生成课程表
        this.generateCourseSchedule(group);

        // 显示弹窗
        this.modal.style.display = 'block';
    }

    // 关闭弹窗
    private closeModal(): void {
        this.modal.style.display = 'none';
    }

    // 生成课程表
    private generateCourseSchedule(group: ClassNumberGroup): void {
        // 表头：周日到周六
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        
        // 生成表格HTML
        let tableHTML = '<thead><tr>';
        days.forEach(day => tableHTML += `<th>${day}</th>`);
        tableHTML += '</tr></thead>';
        
        // 生成表格主体（13行）
        tableHTML += '<tbody>';
        for (let i = 1; i <= 13; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < 7; j++) {
                tableHTML += '<td></td>';
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody>';
        
        
        // 设置表格HTML
        this.courseSchedule.innerHTML = tableHTML;
        
        // 填充课程时间
        this.populateCourseSchedule(group);
    }

    // 填充课程表
    private populateCourseSchedule(group: ClassNumberGroup): void {
        // 遍历所有时间段
        group.parsed_time_location.forEach(timeInfo => {
            timeInfo.time_slots.forEach(slot => {
                // 注意：day_of_week是1-7表示周一到周日，而表格中第1列是周日（索引0）
                let tableDayIndex = slot.day_of_week;
                if (tableDayIndex === 7) { // 周日
                    tableDayIndex = 0;
                }
                
                // 填充每个节次
                slot.periods.forEach(period => {
                    const rowIndex = period;
                    const cell = this.courseSchedule.rows[rowIndex].cells[tableDayIndex]; // 节次列已删除，直接使用tableDayIndex
                    
                    // 添加课程时间块
                    const timeSlotElement = document.createElement('div');
                    timeSlotElement.className = 'time-slot';
                    timeSlotElement.textContent = `${group.course_name}`;
                    
                    cell.appendChild(timeSlotElement);
                });
            });
        });
    }



    // 处理搜索
    private handleSearch(): void {
        const courseNumber = this.courseNumberInput.value.trim();
        const courseName = this.courseNameInput.value.trim().toLowerCase();
        const groupId = this.groupIdInput.value.trim();

        // 执行搜索
        const results = this.searchGroups(courseNumber, courseName, groupId);
        
        // 显示搜索结果
        this.renderGroups(results, this.searchResultsContainer);
    }

    // 搜索课程组
    private searchGroups(courseNumber: string, courseName: string, groupId: string): ClassNumberGroup[] {
        return groupInfo.filter(group => {
            // 课程编号匹配
            const matchesCourseNumber = courseNumber ? group.course_number === courseNumber : true;
            
            // 课程名称匹配（不区分大小写）
            const matchesCourseName = courseName ? group.course_name.toLowerCase().includes(courseName) : true;
            
            // 课程组ID匹配
            const matchesGroupId = groupId ? group.class_number_group_id === parseInt(groupId) : true;
            
            // 返回同时匹配所有条件的结果
            return matchesCourseNumber && matchesCourseName && matchesGroupId;
        });
    }

    // 处理清除
    private handleClear(): void {
        // 清空输入框
        this.courseNumberInput.value = '';
        this.courseNameInput.value = '';
        this.groupIdInput.value = '';
        
        // 清空搜索结果
        this.searchResultsContainer.innerHTML = '';
    }

    // 渲染课程组列表
    private renderGroups(groups: ClassNumberGroup[], container: HTMLElement): void {
        if (groups.length === 0) {
            container.innerHTML = '<p class="no-results">没有找到匹配的课程组信息</p>';
            return;
        }

        container.innerHTML = groups.map(group => this.renderGroupCard(group)).join('');
        
        // 如果是搜索结果容器，绑定复选框事件
        if (container === this.searchResultsContainer) {
            this.bindCheckboxEvents();
        }
    }

    // 格式化周次信息
    private formatWeekInfo(weekInfo: WeekInfo): string {
        const weekType = weekInfo.week_type ? `(${weekInfo.week_type})` : '';
        return `${weekInfo.start_week}~${weekInfo.end_week}周${weekType}`;
    }

    // 格式化星期几
    private formatDayOfWeek(day: number): string {
        const days = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        return days[day] || `星期${day}`;
    }

    // 格式化时间段
    private formatTimeSlots(timeSlots: TimeSlot[]): string {
        return timeSlots.map(slot => `${this.formatDayOfWeek(slot.day_of_week)}(${slot.periods.join(',')}节)`).join(' ');
    }

    // 格式化校区
    private formatCampus(campus: number): string {
        const campusNames = ['', '1号校区', '2号校区', '3号校区'];
        return campusNames[campus] || `校区${campus}`;
    }

    // 渲染课程组卡片
    private renderGroupCard(group: ClassNumberGroup): string {

        // 渲染解析后的时间地点信息
        const renderParsedTimeLocation = (parsedTimeLocation: ParsedTimeLocation[]): string => {
            return parsedTimeLocation.map(item => {
                return `
                    <div class="time-location-item">
                        <p><strong>周次:</strong> ${this.formatWeekInfo(item.week_info)}</p>
                        <p><strong>校区:</strong> ${this.formatCampus(item.campus)}</p>
                        <p><strong>时间:</strong> ${this.formatTimeSlots(item.time_slots)}</p>
                    </div>
                `;
            }).join('');
        };

        // 检查当前课程组是否已选中
        const isChecked = this.selectedGroupIds.has(group.class_number_group_id);

        return `
            <div class="group-card">
                <div class="card-header">
                    <input type="checkbox" class="group-checkbox" 
                           data-group-id="${group.class_number_group_id}" 
                           ${isChecked ? 'checked' : ''}>
                    <h3>${group.course_name}</h3>
                </div>
                <p><strong>课程组ID:</strong> ${group.class_number_group_id}</p>
                <p><strong>课程编号:</strong> ${group.course_number}</p>
                <p><strong>课堂编号:</strong> ${group.class_numbers.join(',')}</p>
                <p><strong>学分:</strong> ${group.credit}</p>
                <p><strong>考核方式:</strong> ${group.assessment_method}</p>
                <div class="time-location">
                    <strong>时间地点:</strong>
                    ${renderParsedTimeLocation(group.parsed_time_location)}
                </div>
            </div>
        `;
    }

    // 绑定搜索结果中的复选框事件
    private bindCheckboxEvents(): void {
        this.searchResultsContainer.querySelectorAll('.group-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                const groupId = parseInt(target.dataset.groupId!);
                this.handleCheckboxChange(groupId, target.checked);
            });
        });
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new CourseGroupApp();
});