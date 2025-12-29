import React, { useState } from 'react';

const TodoList = () => {
    const [items, setItems] = useState([
        "体验 HTML5 相机",
        "测试地理定位",
        "摇一摇手机测试传感器"
    ]);
    const [newItem, setNewItem] = useState('');

    const addItem = () => {
        if (newItem.trim()) {
            setItems([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const deleteItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    return (
        <section className="card">
            <h2>待办列表</h2>
            <div style={{display: 'flex', marginBottom: '20px'}}>
                <input 
                    type="text" 
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="添加新项目..."
                    style={{flex: 1}}
                />
                <button onClick={addItem}>添加</button>
            </div>
            <ul style={{listStyle: 'none', padding: 0}}>
                {items.map((item, index) => (
                    <li key={index} style={{
                        background: '#f9f9f9', borderBottom: '1px solid #eee', padding: '15px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px'
                    }}>
                        {item}
                        <button style={{backgroundColor: '#ff4444', padding: '5px 10px', fontSize: '14px'}} 
                                onClick={() => deleteItem(index)}>删除</button>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default TodoList;
