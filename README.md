# 课程信息处理系统

## 项目简介

本项目用于处理课程信息数据，主要功能是从Excel文件读取课程信息，转换为JSON格式，并对"时间地点"字段进行结构化解析，方便后续开发使用。

## 目录结构

```
classArrange/
├── classInfo.xlsx          # 原始Excel课程信息文件
├── classInfo.json          # 从Excel转换的原始JSON文件
├── classInfo_processed.json # 处理后的JSON文件，包含解析后的时间地点
├── excel_to_json.py        # Excel转JSON的脚本
├── parse_time_location.py  # 时间地点解析器模块
├── process_class_info.py   # 主处理程序
├── requirements.txt        # 项目依赖
├── README.md               # 项目说明文档
└── CHANGELOG.md            # 版本更新日志
```

## 功能说明

### 1. Excel转JSON功能

`excel_to_json.py` 用于将Excel文件转换为JSON格式，保留所有原始字段。

### 2. 时间地点解析功能

`parse_time_location.py` 提供了时间地点解析器，能够处理各种复杂格式的时间地点信息：

- **周次格式**：
  - 普通周：如 "1~16周"
  - 单周：如 "1~13(单)周"
  - 双周：如 "2~16(双)周"

- **地点信息**：如 "3C202", "1201" 等教室编号

- **时间段信息**：如 "4(3,4)" 表示星期四的第3、4节课

- **多时间段**：支持使用换行符分隔的多个时间段

### 3. 数据处理功能

`process_class_info.py` 是主处理程序，主要功能：
- 读取原始JSON文件
- 对每个课程的"时间地点"字段进行解析
- 添加"parsed_time_location"字段，包含结构化的时间地点信息
- 将处理后的数据保存为新的JSON文件

## 安装依赖

```bash
pip install -r requirements.txt
```

## 使用方法

### 1. 转换Excel到JSON

```bash
python excel_to_json.py
```

### 2. 处理时间地点信息

```bash
python process_class_info.py
```

## 数据格式说明

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

### 处理后的时间地点格式

```json
{
    "parsed_time_location": [
        {
            "week_info": {
                "start_week": 1,
                "end_week": 8,
                "week_type": null
            },
            "location": "1201",
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

- `time_slots`：时间段列表
  - `day_of_week`：星期几（1-7表示周一到周日）
  - `periods`：节次列表（如[3,4]表示第3、4节课）

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
