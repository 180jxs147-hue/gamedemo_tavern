将 UI 素材放在本目录下，前端使用 /assets/ui/... 的固定路径引用，便于你直接替换同名文件。

生成脚本：
- scripts/generate_pixel_ui_assets.py：生成像素风按钮、窗体边框(9-slice)、地板瓦片、职业/种族/状态图标与更多立绘。
- scripts/verify_ui_assets.py：校验关键素材是否存在、尺寸是否符合预期、透明通道是否为空。

常用路径：
- 按钮：public/assets/ui/buttons/
- 边框(9-slice)：public/assets/ui/frames/
- 平铺纹理：public/assets/ui/tiles/

