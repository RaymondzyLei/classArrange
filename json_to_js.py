import json
import os

def json_to_js():
    """将JSON文件转换为JavaScript代码"""
    print("\n=== 开始将JSON文件转换为JavaScript代码 ===")
    
    # 检查是否存在必要的JSON文件
    required_files = [
        'classInfo_processed_with_group_id.json',
        'classNumberGroup.json'
    ]
    
    for file in required_files:
        if not os.path.exists(file):
            print(f"错误: 未找到{file}文件")
            print("请先运行完整的数据处理流程")
            return False
    
    # 读取JSON文件
    print("正在读取JSON文件...")
    
    with open('classInfo_processed_with_group_id.json', 'r', encoding='utf-8') as f:
        class_info = json.load(f)
    
    with open('classNumberGroup.json', 'r', encoding='utf-8') as f:
        group_info = json.load(f)
    
    # 生成JavaScript代码
    print("正在生成JavaScript代码...")
    
    js_code = f'''// 课程信息数据
// 生成时间: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
const infoCreateTime = {__import__('datetime').datetime.now().strftime('"%Y%m%d%H%M%S"')};

// 课程详情信息
const classInfo = {json.dumps(class_info, ensure_ascii=False, indent=2)};

// 课程分组信息
const groupInfo = {json.dumps(group_info, ensure_ascii=False, indent=2)};

// 导出数据（如果在模块化环境中使用）
try {{
    if (typeof module !== 'undefined' && module.exports) {{
        module.exports = {{ classInfo, groupInfo, infoCreateTime }};
    }}
}} catch (e) {{
    // 忽略错误，非模块化环境中使用
}}
'''
    
    # 保存为JavaScript文件
    output_file = 'class_info_data.js'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_code)
    
    print(f"成功生成{output_file}文件")
    print(f"- 包含 {len(class_info)} 条课程信息")
    print(f"- 包含 {len(group_info)} 个课程分组")
    
    return True


if __name__ == "__main__":
    json_to_js()
