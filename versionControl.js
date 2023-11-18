// Action types
const SAVE_FILE = 'SAVE_FILE';
const COMMIT_CHANGES = 'COMMIT_CHANGES';
const CREATE_BRANCH = 'CREATE_BRANCH';
const SWITCH_BRANCH = 'SWITCH_BRANCH';
const MERGE_BRANCH = 'MERGE_BRANCH';

// Action creators
const mergeBranch = (branchName) => ({
    type: MERGE_BRANCH,
    payload: branchName,
});

// Action creators
const switchBranch = (branchName) => ({
    type: SWITCH_BRANCH,
    payload: branchName,
});

// Action creators
const saveFile = (fileContent, commitMessage) => ({
    type: SAVE_FILE,
    payload: { fileContent, commitMessage },
});


const createBranch = (branchName) => ({ // Add this function
    type: CREATE_BRANCH,
    payload: branchName,
});

const commitChanges = () => ({
    type: COMMIT_CHANGES,
});

// Initial state
const initialState = {
    tempVersion: null,
    currentBranch: `root_${new Date().toISOString().split('T')[0]}`,
    branches: {
        [`root_${new Date().toISOString().split('T')[0]}`]: [],
    },
};

// Reducer
// Reducer
const fileReducer = (state = initialState, action) => {
    switch (action.type) {
        case SAVE_FILE:
            return {
                ...state,
                tempVersion: {
                    content: action.payload.fileContent,
                    commitMessage: action.payload.commitMessage,
                    timestamp: new Date(),
                    saveCount: 1,
                },
            };
        case COMMIT_CHANGES:
            if (!state.tempVersion) {
                return state;
            }
            const commit = {
                ...state.tempVersion,
                branch: state.currentBranch,
            };
            return {
                ...state,
                tempVersion: null,
                branches: {
                    ...state.branches,
                    [state.currentBranch]: [
                        ...state.branches[state.currentBranch],
                        commit,
                    ],
                },
            };
        case CREATE_BRANCH:
            return {
                ...state,
                currentBranch: action.payload,
                branches: {
                    ...state.branches,
                    [action.payload]: [...state.branches[state.currentBranch]],
                },
            };
        case SWITCH_BRANCH:
            return {
                ...state,
                currentBranch: action.payload,
            };
            case MERGE_BRANCH:
                if (!(action.payload in state.branches)) {
                    return state;
                }
    
                // Check if the last commit of the current branch and the branch to be merged are the same
                const currentBranchLastCommit = state.branches[state.currentBranch][state.branches[state.currentBranch].length - 1];
                const mergingBranchLastCommit = state.branches[action.payload][state.branches[action.payload].length - 1];
    
                let conflict = false;
                if (currentBranchLastCommit.content !== mergingBranchLastCommit.content) {
                    conflict = true;
                }
    
                return {
                    ...state,
                    conflict,
                    branches: {
                        ...state.branches,
                        [state.currentBranch]: [
                            ...state.branches[state.currentBranch],
                            ...state.branches[action.payload],
                        ],
                    },
                };
    

        default:
            return state;
    }
};
// Create the Redux store
const store = Redux.createStore(fileReducer);

// Dispatch the saveFile action when the save button is clicked
const saveButton = document.getElementById('save-button');

saveButton.addEventListener('click', () => {
    const fileContent = textArea.value;
    const commitMessage = prompt('Enter a commit message for the save');
    store.dispatch(saveFile(fileContent, commitMessage));
    alert('Remember to also click "Commit" to save your changes.');
});


// Add a click event for the "Switch Branch" button
const switchBranchButton = document.getElementById('switch-branch-button');

switchBranchButton.addEventListener('click', () => {
    const branchName = prompt('Enter a branch name to switch to');
    if (branchName in store.getState().branches) {
        store.dispatch(switchBranch(branchName));
        messageElement.textContent = 'Switched to branch: ' + branchName;
    } else {
        alert('Branch does not exist');
    }
});


// Dispatch the commitChanges action when the commit button is clicked
const commitButton = document.getElementById('commit-button');
// Dispatch the commitChanges action when the commit button is clicked
const messageElement = document.getElementById('message');

commitButton.addEventListener('click', () => {
    if (store.getState().tempVersion) {
        store.dispatch(commitChanges());
        messageElement.textContent = 'Changes successfully committed!';
    } else {
        alert('No changes to commit. Please click "Save" first.');
    }
});


const viewHistoryButton = document.getElementById('view-history-button');
const commitHistoryElement = document.getElementById('commit-history');

viewHistoryButton.addEventListener('click', () => {
    const state = store.getState();
    let commitHistoryHtml = '';
    for (const branch in state.branches) {
        commitHistoryHtml += `<p><strong>${branch}</strong></p>`;
        state.branches[branch].forEach((commit, index) => {
            commitHistoryHtml += `
          <p style="margin-left: 20px;">
            <button class="commit-button" data-branch="${branch}" data-index="${index}">
              ${commit.timestamp.toLocaleString()} - ${commit.commitMessage}
            </button>
          </p>
        `;
        });
    }
    commitHistoryElement.innerHTML = commitHistoryHtml;
});

// Add a click event for each commit in the list
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('commit-button')) {
        const branch = event.target.getAttribute('data-branch');
        const index = event.target.getAttribute('data-index');
        const commit = store.getState().branches[branch][index];
        document.getElementById('commit-content').textContent = commit.content;
        textArea.value = commit.content;
    }
});


//  "Create Branch" button
const createBranchButton = document.getElementById('create-branch-button');

createBranchButton.addEventListener('click', () => {
    const branchName = prompt('Enter a branch name');
    if (branchName) {
        store.dispatch(createBranch(branchName));
        messageElement.textContent = 'successfully created branch: ' + branchName;
    }

});

// "Merge Branch" button
const mergeBranchButton = document.getElementById('merge-branch-button');

mergeBranchButton.addEventListener('click', () => {
    const branchName = prompt('Enter a branch name to merge into the current branch');
    if (branchName in store.getState().branches) {
        store.dispatch(mergeBranch(branchName));
        const state = store.getState();
        if (state.conflict) {
            messageElement.textContent = 'Conflict detected when merging branch: ' + branchName + ' into current branch';
        } else {
            messageElement.textContent = 'Merged branch: ' + branchName + ' into current branch';
        }
    } else {
        alert('Branch does not exist');
    }
});