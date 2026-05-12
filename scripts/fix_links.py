import os
import re

directory = r'c:\Users\chira\OneDrive\GitHub\blog.oriz.in\src\content\blog\substance-use-education-india'

# Pattern for absolute links
pattern_abs = re.compile(r'\(file:///.*?/part-(\d+)-([\w-]+)\.mdx\)')

# Fix for Part 44 label mismatch in Part 43
part44_label_fix = (
    "Part 44: Dexamethasone – The 'Life-Saving' Steroid and the 'Moon Face' Reality",
    "Part 44: Nandrolone – The Gym-Culture Steroid and the 'Deca-Dick' Reality"
)

def fix_all():
    for filename in os.listdir(directory):
        if filename.endswith('.mdx'):
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Fix absolute links
            new_content = pattern_abs.sub(r'(./part-\1-\2)', content)
            
            # Fix specific label and link for Part 43 -> 44 transition
            if filename == "part-43-bupropion.mdx":
                new_content = new_content.replace(part44_label_fix[0], part44_label_fix[1])
                new_content = new_content.replace('./part-44-dexamethasone', './part-44-nandrolone')
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated: {filename}")

if __name__ == "__main__":
    fix_all()
