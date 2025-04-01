/* globals G6, data */

// Define the categories and levels for organizing skills
const categories = {
    'env': '计算机基础与编程环境',
    'cpp': 'C++程序设计',
    'ds': '数据结构',
    'algo': '算法',
    'math': '数学'
};

const levels = {
    'basic': { name: '入门级', range: [1, 3] },
    'intermediate': { name: '提高级', range: [4, 6] },
    'noi': { name: 'NOI级', range: [7, 10] }
};

// Process nodes to categorize them
const categorizedNodes = {
    'basic-env': [], 'basic-cpp': [], 'basic-ds': [], 'basic-algo': [], 'basic-math': [],
    'intermediate-env': [], 'intermediate-cpp': [], 'intermediate-ds': [], 'intermediate-algo': [], 'intermediate-math': [],
    'noi-env': [], 'noi-cpp': [], 'noi-ds': [], 'noi-algo': [], 'noi-math': []
};

// Map node IDs to their objects for quick lookup
const nodeMap = {};

// Process data to categorize nodes
function processData() {
    data.nodes.forEach(node => {
        // Store node in map for quick lookup
        nodeMap[node.id] = node;
        
        // Determine the level category
        let levelCategory;
        const level = node.data.level;
        
        if (level >= 1 && level <= 3) {
            levelCategory = 'basic';
        } else if (level >= 4 && level <= 6) {
            levelCategory = 'intermediate';
        } else {
            levelCategory = 'noi';
        }
        
        // Determine the subject category based on node ID
        let subjectCategory;
        const id = node.id;
        
        if (id.startsWith('2.1.1') || id.startsWith('2.2.0')) {
            subjectCategory = 'env';
        } else if (id.startsWith('2.1.2') || id.startsWith('2.2.1')) {
            subjectCategory = 'cpp';
        } else if (id.startsWith('2.1.3') || id.startsWith('2.2.2') || id.startsWith('2.3.1')) {
            subjectCategory = 'ds';
        } else if (id.startsWith('2.1.4') || id.startsWith('2.2.3') || id.startsWith('2.3.2')) {
            subjectCategory = 'algo';
        } else {
            subjectCategory = 'math';
        }
        
        // Add node to the appropriate category
        const categoryKey = `${levelCategory}-${subjectCategory}`;
        if (categorizedNodes[categoryKey]) {
            categorizedNodes[categoryKey].push(node);
        }
    });
}

// Populate the skill table with categorized nodes
function populateSkillTable() {
    for (const [categoryKey, nodes] of Object.entries(categorizedNodes)) {
        const cell = document.getElementById(categoryKey);
        if (cell && nodes.length > 0) {
            nodes.forEach(node => {
                const skillItem = document.createElement('div');
                skillItem.className = `skill-item level-${node.data.level}`;
                skillItem.dataset.id = node.id;
                
                const difficulty = document.createElement('span');
                difficulty.className = 'difficulty';
                difficulty.textContent = `【${node.data.level}】`;
                
                const content = document.createElement('span');
                content.textContent = node.label;
                
                skillItem.appendChild(difficulty);
                skillItem.appendChild(content);
                
                // Add click event listener
                skillItem.addEventListener('click', () => handleSkillClick(node.id));
                
                cell.appendChild(skillItem);
            });
        }
    }
}

// Handle skill item click
function handleSkillClick(nodeId) {
    // Clear previous highlights
    clearHighlights();
    
    // Highlight the clicked item
    highlightNode(nodeId);
    
    // Show dependencies
    showDependencies(nodeId);
    
    // Show detail panel
    showDetailPanel(nodeId);
    
    // Show dependency graph
    showDependencyGraph(nodeId);
}

// Highlight a node and its dependencies
function highlightNode(nodeId) {
    const elements = document.querySelectorAll(`.skill-item[data-id="${nodeId}"]`);
    elements.forEach(el => {
        el.classList.add('highlighted');
        el.classList.add('pulse');
    });
}

// Clear all highlights
function clearHighlights() {
    const elements = document.querySelectorAll('.skill-item.highlighted');
    elements.forEach(el => {
        el.classList.remove('highlighted');
        el.classList.remove('pulse');
    });
    
    // Hide detail panel
    document.getElementById('detail-panel').style.display = 'none';
    
    // Hide dependency graph
    document.getElementById('dependency-graph').style.display = 'none';
}

// Show dependencies of a node
function showDependencies(nodeId) {
    // Find all edges where this node is source or target
    const dependencies = data.edges.filter(edge => 
        edge.source === nodeId || edge.target === nodeId
    );
    
    // Highlight all connected nodes
    dependencies.forEach(edge => {
        const connectedId = edge.source === nodeId ? edge.target : edge.source;
        highlightNode(connectedId);
    });
}

// Show detail panel for a node
function showDetailPanel(nodeId) {
    const node = nodeMap[nodeId];
    if (!node) return;
    
    const detailPanel = document.getElementById('detail-panel');
    const detailContent = document.getElementById('detail-content');
    
    // Create content for detail panel
    let html = `
        <h4>${node.label}</h4>
        <p><strong>难度级别:</strong> ${node.data.level}</p>
        <p><strong>ID:</strong> ${node.id}</p>
    `;
    
    // Find prerequisites (nodes that point to this node)
    const prerequisites = data.edges
        .filter(edge => edge.target === nodeId)
        .map(edge => nodeMap[edge.source]);
    
    if (prerequisites.length > 0) {
        html += '<h5>前置知识点:</h5><ul>';
        prerequisites.forEach(prereq => {
            html += `<li>${prereq.label} (难度: ${prereq.data.level})</li>`;
        });
        html += '</ul>';
    }
    
    // Find dependent nodes (nodes that this node points to)
    const dependents = data.edges
        .filter(edge => edge.source === nodeId)
        .map(edge => nodeMap[edge.target]);
    
    if (dependents.length > 0) {
        html += '<h5>后续知识点:</h5><ul>';
        dependents.forEach(dependent => {
            html += `<li>${dependent.label} (难度: ${dependent.data.level})</li>`;
        });
        html += '</ul>';
    }
    
    detailContent.innerHTML = html;
    detailPanel.style.display = 'block';
}

// Show dependency graph using G6
function showDependencyGraph(nodeId) {
    const graphContainer = document.getElementById('dependency-graph');
    graphContainer.style.display = 'block';
    graphContainer.innerHTML = '';
    
    // Find all connected nodes (1-level deep)
    const connectedNodes = new Set([nodeId]);
    data.edges.forEach(edge => {
        if (edge.source === nodeId) connectedNodes.add(edge.target);
        if (edge.target === nodeId) connectedNodes.add(edge.source);
    });
    
    // Create subgraph data
    const subgraphData = {
        nodes: Array.from(connectedNodes).map(id => {
            const node = nodeMap[id];
            return {
                id: node.id,
                label: node.label,
                style: {
                    fill: getColorForLevel(node.data.level),
                    stroke: id === nodeId ? '#ff4d4f' : '#91d5ff',
                    lineWidth: id === nodeId ? 2 : 1
                },
                labelCfg: {
                    style: {
                        fill: node.data.level > 2 ? 'white' : 'black',
                        fontSize: id === nodeId ? 14 : 12,
                        fontWeight: id === nodeId ? 'bold' : 'normal'
                    }
                }
            };
        }),
        edges: data.edges.filter(edge => 
            connectedNodes.has(edge.source) && connectedNodes.has(edge.target)
        ).map(edge => ({
            source: edge.source,
            target: edge.target,
            style: {
                stroke: '#91d5ff',
                lineWidth: 1,
                endArrow: true
            }
        }))
    };
    
    // Initialize G6 graph
    const graph = new G6.Graph({
        container: 'dependency-graph',
        width: graphContainer.offsetWidth,
        height: graphContainer.offsetHeight,
        modes: {
            default: ['drag-canvas', 'zoom-canvas', 'drag-node']
        },
        layout: {
            type: 'force',
            preventOverlap: true,
            linkDistance: 100,
            nodeStrength: -50,
            edgeStrength: 0.1
        },
        defaultNode: {
            size: 40,
            type: 'circle',
            labelCfg: {
                position: 'bottom',
                offset: 10
            }
        },
        defaultEdge: {
            type: 'cubic',
            style: {
                endArrow: true
            }
        }
    });
    
    graph.data(subgraphData);
    graph.render();
    
    // Center the graph on the selected node
    graph.focusItem(nodeId, true);
}

// Helper function to get color for level
function getColorForLevel(level) {
    return `var(--level-${level}-color)`;
}

// Initialize the application
function init() {
    processData();
    populateSkillTable();
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
