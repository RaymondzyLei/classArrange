# 课程信息处理与查询系统

## 项目简介

本项目用于处理课程信息数据，并提供前端查询界面。主要功能包括：
1. 从Excel文件读取课程信息，转换为JSON格式
2. 对"时间地点"字段进行结构化解析
3. 将课程按时间和校区信息分组
4. 提供基于课程编号、课程名称和课程组ID的搜索功能
5. 支持课程组的选择、存储和详细信息查看
6. 直观的课程表展示

## 技术栈

- **后端/数据处理**：Python 3.7+
- **前端**：HTML5 + CSS3 + TypeScript
- **数据格式**：JSON + JavaScript对象

## 目录结构

```
classArrange/
├── classInfo.xlsx                    # 原始Excel课程信息文件
├── classInfo.json                    # 从Excel转换的原始JSON文件
├── classInfo_processed.json          # 处理后的JSON文件，包含解析后的时间地点
├── classInfo_processed_with_group_id.json # 添加了group_id的课程信息
├── classNumberGroup.json             # class_number_group数据
├── class_info_data.js                # JavaScript格式的数据文件
├── data_processing/                  # 数据处理相关脚本
│   ├── excel_to_json.py              # Excel转JSON的脚本
│   ├── parse_time_location.py        # 时间地点解析器模块
│   ├── process_class_info.py         # 主处理程序
│   ├── process_class_number_group.py # class_number_group生成程序
│   ├── main.py                       # 一键执行完整流程的主程序
│   └── json_to_js.py                 # JSON转JavaScript的脚本
├── index.html                        # 前端HTML文件
├── styles.css                        # 前端CSS文件
├── app.ts                            # 前端TypeScript文件
├── app.js                            # 编译后的JavaScript文件
├── tsconfig.json                     # TypeScript配置文件
├── requirements.txt                  # 项目依赖
├── README.md                         # 项目说明文档
└── CHANGELOG.md                      # 版本更新日志
```

## 功能说明

### 前端功能

#### 1. 课程组搜索
- 支持通过课程编号(course_number)搜索
- 支持通过课程名称(course_name)搜索（不区分大小写）
- 支持通过课程组ID(class_number_group_id)搜索

#### 2. 课程组选择与存储
- 可以勾选搜索结果中的课程组
- 已选课程组会显示在页面顶部的"已选课程组"区域
- 已选课程组ID会自动存储到localStorage中，刷新页面后仍然保留
- 可以从已选课程组列表中删除不需要的课程组

#### 3. 课程详情弹窗
- 点击已选课程组卡片，会弹出模态窗口显示详细信息
- 弹窗中包含课程的完整信息：课程名、组ID、课程编号、课堂编号、学分、考核方式、周次和校区等
- 弹窗中包含一个13行7列的课程表，直观展示上课时间
- 课程表第一列为周日，第5-6行和10-11行之间有明显间隙，表示中午和晚上休息时间
- 课程的上课时间区块会填充蓝色，便于查看

### 后端/数据处理功能

#### 1. Excel转JSON功能

`excel_to_json.py` 用于将Excel文件转换为JSON格式，保留所有原始字段。

#### 2. 时间地点解析功能

`parse_time_location.py` 提供了时间地点解析器，能够处理各种复杂格式的时间地点信息：

- **周次格式**：
  - 普通周：如 "1~16周"
  - 单周：如 "1~13(单)周"
  - 双周：如 "2~16(双)周"

- **地点信息**：如 "3C202", "1201" 等教室编号

- **校区信息**：根据地点自动识别校区
  - 1号校区：地点以"1"、"2"、"5"开头
  - 2号校区：地点以"3"开头
  - 3号校区：地点以"GT"开头

- **时间段信息**：如 "4(3,4)" 表示星期四的第3、4节课

- **多时间段**：支持使用换行符分隔的多个时间段

#### 3. 数据处理功能

`process_class_info.py` 是主处理程序，主要功能：
- 读取原始JSON文件
- 将所有中文字段名转换为英文
- 对每个课程的"时间地点"字段进行解析
- 添加"parsed_time_location"字段，包含结构化的时间地点信息
- 删除"time_location"字段中的"_x000d_"特殊字符
- 将"class_id"拆分为"course_number"和"class_number"
- 将处理后的数据保存为新的JSON文件

#### 4. class_number_group功能

`process_class_number_group.py` 用于将课程按时间和校区信息分组：
- 将时间和校区相同的class_number分到同一个group中
- 为每个group生成唯一的class_number_group_id
- 保留course_name、credit、assessment_method等课程信息
- 生成两个新文件：
  - `classNumberGroup.json`：包含所有class_number_group的信息
  - `classInfo_processed_with_group_id.json`：在原数据基础上添加了class_number_group_id字段

#### 5. 一键执行完整流程

`main.py` 提供了一键执行完整数据处理流程的功能：
- 自动按顺序执行所有处理步骤
- 检查输入和输出文件的存在性
- 显示清晰的执行进度和结果
- 处理编码问题，确保在Windows环境下正常运行

## 安装依赖

### 后端/数据处理依赖

```bash
pip install -r requirements.txt
```

### 前端依赖

前端需要安装TypeScript编译器：

```bash
npm install -g typescript
```

或

```bash
yarn global add typescript
```

## 使用方法

### 后端/数据处理使用方法

#### 1. 一键执行完整流程（推荐）

```bash
# 进入数据处理目录
cd data_processing
# 运行主程序
python main.py
```

这将自动执行以下所有步骤：
1. Excel转JSON
2. 课程信息处理
3. class_number_group生成
4. JSON转JavaScript

#### 2. 分步执行

##### 2.1 转换Excel到JSON

```bash
cd data_processing
python excel_to_json.py
```

##### 2.2 处理时间地点信息

```bash
cd data_processing
python process_class_info.py
```

##### 2.3 生成class_number_group

```bash
cd data_processing
python process_class_number_group.py
```

##### 2.4 将JSON转换为JavaScript

```bash
cd data_processing
python json_to_js.py
```

### 前端使用方法

#### 1. 编译TypeScript文件

```bash
tsc app.ts
```

或使用tsconfig.json配置编译：

```bash
tsc
```

#### 2. 启动前端应用

使用Python启动一个简单的HTTP服务器：

```bash
python -m http.server 8000
```

或使用Node.js的http-server：

```bash
npm install -g http-server
http-server
```

然后在浏览器中访问：http://localhost:8000

## 数据格式说明

最终的输出文件为 `class_info_data.js`，包含以下内容：
- 课程信息数据（classInfo），与`classInfo_processed_with_group_id.json`格式相同
- 课程分组数据（groupInfo），与`classNumberGroup.json`格式相同
- 生成时间（infoCreateTime），格式为"YYYYMMDDHHMMSS"，例如"20260112233954"

### 原始JSON数据格式

```json
{
    "课堂号": "001046.01",
    "课程名": "数值分析",
    "开课单位": "001 数学科学学院",
    "授课教师": "徐岩,夏银华",
    "时间地点": "1~8周 1201: 2(8,9) 4(3,4,5)_x000d_\n9~12周 1201: 2(8,9) 4(3,4,5)",
    "学分": 3.0,
    "学时": 60,
    "学历层次": "本科",
    "课堂类型": "计划内与自由选修",
    "课程范畴分类": null,
    "课程类型": "理论课",
    "授课语言": "中文",
    "考核方式": "笔试（闭卷）",
    "本研同堂": 0,
    "选课人数": 0,
    "限选人数": 130,
    "上课班级": "23信息与计算科学*,23数据科学与大数据技术*"
}
```

### 字段名映射表

| 中文字段名 | 英文字段名 |
|------------|------------|
| 课堂号 | class_id |
| 课程名 | course_name |
| 开课单位 | department |
| 授课教师 | teachers |
| 时间地点 | time_location |
| 学分 | credit |
| 学时 | hours |
| 学历层次 | education_level |
| 课堂类型 | class_type |
| 课程范畴分类 | course_category |
| 课程类型 | course_type |
| 授课语言 | teaching_language |
| 考核方式 | assessment_method |
| 本研同堂 | undergraduate_graduate_together |
| 选课人数 | enrolled_students |
| 限选人数 | maximum_students |
| 上课班级 | target_classes |

### 处理后的JSON数据格式

```json
{
    "class_id": "001046.01",
    "course_name": "数值分析",
    "department": "001 数学科学学院",
    "teachers": "徐岩,夏银华",
    "time_location": "1~8周 1201: 2(8,9) 4(3,4,5)\n9~12周 1201: 2(8,9) 4(3,4,5)",
    "credit": 3.0,
    "hours": 60,
    "education_level": "本科",
    "class_type": "计划内与自由选修",
    "course_category": null,
    "course_type": "理论课",
    "teaching_language": "中文",
    "assessment_method": "笔试（闭卷）",
    "undergraduate_graduate_together": 0,
    "enrolled_students": 0,
    "maximum_students": 130,
    "target_classes": "23信息与计算科学*,23数据科学与大数据技术*",
    "course_number": "001046",
    "class_number": "01",
    "parsed_time_location": [
        {
            "week_info": {
                "start_week": 1,
                "end_week": 8,
                "week_type": null
            },
            "location": "1201",
            "campus": 1,
            "time_slots": [
                {
                    "day_of_week": 2,
                    "periods": [8, 9]
                },
                {
                    "day_of_week": 4,
                    "periods": [3, 4, 5]
                }
            ]
        },
        {
            "week_info": {
                "start_week": 9,
                "end_week": 12,
                "week_type": null
            },
            "location": "1201",
            "campus": 1,
            "time_slots": [
                {
                    "day_of_week": 2,
                    "periods": [8, 9]
                },
                {
                    "day_of_week": 4,
                    "periods": [3, 4, 5]
                }
            ]
        }
    ]
}
```

### parsed_time_location字段说明

- `week_info`：周次信息
  - `start_week`：开始周次
  - `end_week`：结束周次
  - `week_type`：周次类型（null表示普通周，"单"表示单周，"双"表示双周）

- `location`：上课地点

- `campus`：校区编号
  - 1：1号校区（地点以"1"、"2"、"5"开头）
  - 2：2号校区（地点以"3"开头）
  - 3：3号校区（地点以"GT"开头）
  - null：其他校区

- `time_slots`：时间段列表
  - `day_of_week`：星期几（1-7表示周一到周日）
  - `periods`：节次列表（如[3,4]表示第3、4节课）

### 课程编号和课堂编号说明

- `course_number`：课程编号，从`class_id`中提取的前半部分（小数点前的内容）
- `class_number`：课堂编号，从`class_id`中提取的后半部分（小数点后的内容）
  - 如果`class_id`中没有小数点，则`class_number`为null
  - 相同`course_number`但不同`class_number`的记录表示同一门课程的不同课堂

### class_number_group数据格式

#### classNumberGroup.json

```json
[
    {
        "class_number_group_id": 1,
        "course_number": "001046",
        "class_numbers": ["01"],
        "course_name": "数值分析",
        "credit": 3.0,
        "assessment_method": "笔试（闭卷）",
        "parsed_time_location": [
            {
                "week_info": {
                    "start_week": 1,
                    "end_week": 8,
                    "week_type": null
                },
                "campus": 1,
                "time_slots": [
                    {
                        "day_of_week": 2,
                        "periods": [8, 9]
                    },
                    {
                        "day_of_week": 4,
                        "periods": [3, 4, 5]
                    }
                ]
            }
        ]
    }
]
```

#### classInfo_processed_with_group_id.json

```json
{
    "class_id": "001046.01",
    "course_name": "数值分析",
    "department": "001 数学科学学院",
    "teachers": "徐岩,夏银华",
    "time_location": "1~8周 1201: 2(8,9) 4(3,4,5)\n9~12周 1201: 2(8,9) 4(3,4,5)",
    "credit": 3.0,
    "hours": 60,
    "education_level": "本科",
    "class_type": "计划内与自由选修",
    "course_category": null,
    "course_type": "理论课",
    "teaching_language": "中文",
    "assessment_method": "笔试（闭卷）",
    "undergraduate_graduate_together": 0,
    "enrolled_students": 0,
    "maximum_students": 130,
    "target_classes": "23信息与计算科学*,23数据科学与大数据技术*",
    "course_number": "001046",
    "class_number": "01",
    "parsed_time_location": [
        {
            "week_info": {
                "start_week": 1,
                "end_week": 8,
                "week_type": null
            },
            "location": "1201",
            "campus": 1,
            "time_slots": [
                {
                    "day_of_week": 2,
                    "periods": [8, 9]
                },
                {
                    "day_of_week": 4,
                    "periods": [3, 4, 5]
                }
            ]
        }
    ],
    "class_number_group_id": 1
}
```

#### class_number_group字段说明

- `class_number_group_id`：class_number_group的唯一标识（纯数字格式）
- `course_number`：课程编号
- `class_numbers`：属于该group的所有class_number
- `course_name`：课程名称
- `credit`：学分
- `assessment_method`：考核方式
- `parsed_time_location`：解析后的时间地点信息（不包含location字段）

## 开发说明

### 时间地点解析器API

```python
from parse_time_location import parse_time_location

# 解析时间地点字符串
parsed_result = parse_time_location("1~16周 3C202: 4(3,4)")

# 返回值格式
[
    {
        "week_info": {
            "start_week": 1,
            "end_week": 16,
            "week_type": None
        },
        "location": "3C202",
        "campus": 2,
        "time_slots": [
            {
                "day_of_week": 4,
                "periods": [3, 4]
            }
        ]
    }
]
```

### 扩展建议

1. 可以添加更多的数据验证和错误处理
2. 可以支持更多的时间地点格式
3. 可以添加数据可视化功能
4. 可以与数据库集成，实现数据持久化

## 注意事项

- 原始Excel文件必须包含17列数据，第一行为字段名
- 确保安装了所有依赖包
- 处理后的JSON文件会覆盖现有文件，请谨慎操作
