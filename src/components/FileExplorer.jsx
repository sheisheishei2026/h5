import React, { useState } from 'react';

const FileExplorer = () => {
    const [directory, setDirectory] = useState(null);

    const handleDirectorySelect = (event) => {
        const files = event.target.files;
        if (files.length === 0) return;

        const tree = {};
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const path = file.webkitRelativePath || file.name;
            const parts = path.split('/');
            
            let currentLevel = tree;
            parts.forEach((part, index) => {
                if (!currentLevel[part]) {
                    if (index === parts.length - 1) {
                        currentLevel[part] = { __type: 'file', fileObj: file };
                    } else {
                        currentLevel[part] = { __type: 'folder', children: {} };
                    }
                }
                if (index < parts.length - 1) {
                    currentLevel = currentLevel[part].children;
                }
            });
        }
        setDirectory(tree);
    };

    const renderNode = (node, name) => {
        if (node.__type === 'file') {
            return (
                <li key={name} style={{paddingLeft: '20px'}}>
                    📄 {name} <span style={{fontSize: '0.8em', color: '#999'}}>({(node.fileObj.size/1024).toFixed(1)} KB)</span>
                </li>
            );
        } else {
            return (
                <li key={name} style={{paddingLeft: '20px'}}>
                    <div>📁 {name}</div>
                    <ul style={{listStyle: 'none', padding: 0}}>
                        {Object.keys(node.children).map(key => renderNode(node.children[key], key))}
                    </ul>
                </li>
            );
        }
    };

    return (
        <section className="card">
            <h2>📂 本地文件目录展示</h2>
            <div className="api-demo">
                <label style={{display: 'inline-block', padding: '10px 20px', backgroundColor: '#317EFB', color: 'white', borderRadius: '4px', cursor: 'pointer'}}>
                    选择并展示文件夹目录
                    <input type="file" webkitdirectory="" directory="" multiple style={{display: 'none'}} onChange={handleDirectorySelect} />
                </label>
                
                <div className="output-box" style={{maxHeight: '300px', overflowY: 'auto', textAlign: 'left'}}>
                    {!directory && <p style={{color: '#999', textAlign: 'center'}}>暂无数据，请选择一个文件夹</p>}
                    {directory && (
                        <ul style={{listStyle: 'none', padding: 0}}>
                             {Object.keys(directory).map(rootName => renderNode(directory[rootName], rootName))}
                        </ul>
                    )}
                </div>
            </div>
        </section>
    );
};

export default FileExplorer;
