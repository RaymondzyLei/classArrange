import json
from parse_time_location import parse_time_location

# 主程序
def main():
    # 读取原始JSON文件
    with open('classInfo.json', 'r', encoding='utf-8') as f:
        class_data = json.load(f)
    
    # 处理每个课程的时间地点信息
    processed_data = []
    error_count = 0
    
    for i, course in enumerate(class_data):
        try:
            # 获取原始时间地点信息
            original_time_location = course.get('时间地点', '')
            
            # 解析时间地点信息
            parsed_time_location = parse_time_location(original_time_location)
            
            # 创建新的课程条目，保留原始字段并添加解析后的字段
            processed_course = course.copy()
            processed_course['parsed_time_location'] = parsed_time_location
            
            processed_data.append(processed_course)
            
            # 打印进度信息
            if (i + 1) % 100 == 0:
                print(f"已处理 {i + 1}/{len(class_data)} 条记录")
                
        except Exception as e:
            # 记录错误并继续处理其他记录
            print(f"处理第 {i + 1} 条记录时出错: {e}")
            print(f"原始时间地点信息: {original_time_location}")
            error_count += 1
            # 即使出错也要保留原始数据
            processed_course = course.copy()
            processed_course['parsed_time_location'] = []
            processed_data.append(processed_course)
    
    # 将处理后的数据保存为新的JSON文件
    with open('classInfo_processed.json', 'w', encoding='utf-8') as f:
        json.dump(processed_data, f, ensure_ascii=False, indent=4)
    
    print(f"\n处理完成！")
    print(f"共处理 {len(class_data)} 条记录")
    print(f"其中 {error_count} 条记录处理时出现错误")
    print(f"处理后的数据已保存到 classInfo_processed.json")

# 运行主程序
if __name__ == "__main__":
    main()
