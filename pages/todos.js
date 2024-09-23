import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Colours, Typography } from '../definitions';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import apiFetch from '../functions/apiFetch';
import Tabs from '../components/Tabs'

const TodosPage = () => {
    const [todos, setTodos] = useState([]);
    const [activeTab, setActiveTab] = useState("Incomplete Todos")
    const [editingTodoID, setEditingTodoID] = useState(null)
    const [newName, setNewName] = useState("")

    // function to toggle task done on button click
    async function toggleDone(todoID, currentStatus) {
        try {
            const response = await apiFetch(`/todo/${todoID}`, {
                method: "PATCH",
                body: { "done": !currentStatus }
            })

            if (response.status === 200) {
                // refresh state on changed todo
                updateTodos();
            } else {
                console.error("Failed to fetch todo", response)
            }
        } catch (err) {
            console.error("Error updating todo", err)
        }
    }

    // function to update the name of a todo
    async function updateTodoName(todoID) {
        try {
            const response = await apiFetch(`/todo/${todoID}`, {
                method: 'PATCH',
                body: { "name": newName }
            });
        
            if (response.status === 200) {
                console.log("88", setEditingTodoID)
                setEditingTodoID(null); // no longer editing any todo name
                updateTodos() // refresh state on changed todo
            } else {
                console.error('Failed to update todo name', response);
            }
        } catch (err) {
            console.error('Error updating todo name', err);
        }
    }

    // function to handle entering edit mode for a todo name
    function handleEditClick(todoID, currentName) {
        setEditingTodoID(todoID);
        setNewName(currentName);
    }

    // shared code between incomplete todos & all todos lists, for a single todo
    function todoListItem(todo, idx, incompleteOnly) {
        if (!incompleteOnly || (incompleteOnly && !todo.done)) {
            return (<li key={idx}>
                {editingTodoID === todo.todoID ? // ternary, editing todo : not editing todo
                (<input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={() => updateTodoName(todo.todoID)} // save on blur
                />) : todo.name}
                {todo.done? " (Completed)" : " (Incomplete)"} Created: {todo.created} 
                <Button
                    className="editButton"
                    text="Edit Name"
                    onClick={() => handleEditClick(todo.todoID, todo.name)}
                />
                <Button
                    className="toggleButton"
                    text={todo.done ? "Mark Incomplete" : "Mark Complete"}
                    onClick={() => toggleDone(todo.todoID, todo.done)}
                /></li>)
        }
    }

    // wrapper for the all todos list
    function allTodoListItem(todo, idx) {
        return todoListItem(todo, idx, false)
    }

    // wrapper for the incomplete todos list
    function incompleteTodoListItem(todo, idx) {
        return todoListItem(todo, idx, true)
    }

    // incomplete todos & all todos tabs
    const tabs = [
        {
            title: "Incomplete Todos",
            content: <Container>{todos.map(incompleteTodoListItem)}</Container>,
            onClick: (tabTitle) => {setActiveTab(tabTitle.target.innerText)}
        },
        {
            title: "All Todos",
            content: <Container>{todos.map(allTodoListItem)}</Container>,
            onClick: (tabTitle) => {setActiveTab(tabTitle.target.innerText)}
        }
    ]

    // function to fetch all todos, used for state
    function updateTodos() {
        const fetchTodos = async () => {
            try {
                const response = await apiFetch('/todo', 'GET');
                const data = await response.body;
                console.log(data)
                if (response.status === 200) {
                    setTodos(data);  // Store the fetched todos in state
                } else {
                    console.log('Failed to fetch todos');
                    console.log(response)
                }
            } catch (err) {
                console.log('An error occurred while fetching todos');
                console.log(err)
            }
        }
        fetchTodos();
        console.log("ABC", todos, Object.values(todos))
    }

    useEffect(() => {
        updateTodos();
    }, []);

    return (
        <PageLayout title="Todos">
            <Container>
                <div className="content">
                    <h1>Your Todos</h1>
                    <Tabs activeTab={activeTab} tabs={tabs}/>
                </div>
            </Container>
        </PageLayout>
    );
};

export default TodosPage;

const Container = styled.div`
    width: 100%;

    .content {
        h1 {
            color: ${Colours.BLACK};
            font-size: ${Typography.HEADING_SIZES.M};
            font-weight: ${Typography.WEIGHTS.LIGHT};
            line-height: 2.625rem;
            margin-bottom: 2rem;
            margin-top: 1rem;
        }

        li {
            color: ${Colours.BLACK};
            font-size: ${Typography.BODY_SIZES.XL};
            font-weight: ${Typography.WEIGHTS.REGULAR};
            line-height: 2.625rem;
            margin-bottom: 0.5rem;
            margin-top: 0.5rem;
        }

        .toggleButton {
            font-size: 15px;
        }

        .editButton {
            font-size: 15px;
            background-color: ${Colours.GRAY}
        }
    }
`;