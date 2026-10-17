let usersArray = [];

const loadBtn = document.getElementById('load-users');
const filterInput = document.getElementById('filter-input');
const statusText = document.getElementById('status');
const usersList = document.getElementById('users-list');

loadBtn.addEventListener('click', loadUsers);
filterInput.addEventListener('input', handleFilter);

async function loadUsers() {
    const url = 'https://typicode.com';

    try {
        loadBtn.disabled = true;
        statusText.textContent = 'Loading users...';
        usersList.innerHTML = '';
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        usersArray = await response.json();
        
        statusText.textContent = 'Users loaded successfully.';
        renderUsers(usersArray);
        
    } catch (error) {
        statusText.textContent = `Error loading users: ${error.message}`;
        usersArray = []; 
        usersList.innerHTML = '';
    } finally {
        loadBtn.disabled = false;
    }
}

function renderUsers(list) {
    usersList.innerHTML = '';

    if (list.length === 0) {
        const fallbackLi = document.createElement('li');
        fallbackLi.textContent = 'No users match your filter.';
        usersList.appendChild(fallbackLi);
        return;
    }

    list.forEach(user => {
        const li = document.createElement('li');
        li.style.marginBottom = '10px';

        const nameText = `Name: ${user.name}`;
        const emailText = `Email: ${user.email}`;
        const cityText = `City: ${user.address?.city || 'N/A'}`;
        const companyText = `Company: ${user.company?.name || 'N/A'}`;

        li.textContent = `${nameText} | ${emailText} | ${cityText} | ${companyText}`;
        usersList.appendChild(li);
    });
}

function handleFilter() {
    const searchTerm = filterInput.value.toLowerCase();
    
    const filteredList = usersArray.filter(user => {
        return user.name.toLowerCase().includes(searchTerm);
    });
    
    renderUsers(filteredList);
}
