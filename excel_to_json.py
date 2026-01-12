import pandas as pd
import json

# 读取Excel文件
file_path = 'classInfo.xlsx'
df = pd.read_excel(file_path)

# 转换为JSON格式
json_data = df.to_json(orient='records', force_ascii=False, indent=4)

# 保存到JSON文件
with open('classInfo.json', 'w', encoding='utf-8') as f:
    f.write(json_data)

print("Excel文件已成功转换为JSON格式并保存到classInfo.json")
print(f"共处理了 {len(df)} 行数据")
print(f"包含 {len(df.columns)} 个字段")
