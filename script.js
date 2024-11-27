let currentDirectorate = '';
let selectedRecipient = '';
let messagesSentCount = 0; // Counter for messages sent

function initialize(directorate) {
    currentDirectorate = directorate;
    document.querySelector('h2').textContent = `Messages for ${currentDirectorate}`;
    fetchMessages();
}

function setRecipient(recipient) {
    selectedRecipient = recipient;
    document.getElementById('selectedRecipient').textContent = `Selected Recipient: ${recipient}`;
    document.getElementById('recipientDisplay').textContent = `Recipient: ${recipient}`;
    fetchMessages(); // Fetch messages for the selected recipient
}

async function sendMessage(sender) {
    const messageInput = document.getElementById('message');
    const fileInput = document.getElementById('fileInput');
    const message = messageInput.value;
    const file = fileInput.files[0];

    if (selectedRecipient && (message || file)) {
        const formData = new FormData();
        formData.append('recipient', selectedRecipient);
        formData.append('sender', sender);
        if (message) {
            formData.append('message', message);
        }
        if (file) {
            formData.append('file', file);
        }

        try {
            const response = await fetch('/send-message', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.status === 'Message sent') {
                messagesSentCount++; // Increment the messages sent counter
                fetchMessages(); // Fetch updated messages for the selected recipient
                highlightDirectorate(selectedRecipient); // Highlight the recipient directorate
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    } else {
        alert('Please select a recipient and enter a message or select a file before sending.');
    }
}

async function fetchMessages() {
    try {
        const response = await fetch(`/messages?sender=${currentDirectorate}&recipient=${selectedRecipient}`);
        const data = await response.json();
        const messagesList = document.getElementById('messagesList');
        messagesList.innerHTML = ''; // Clear the current messages

        // Display messages and check for new ones
        data.forEach(msg => {
            displayMessage(msg.sender, msg.message, msg.file);
            if (msg.sender !== currentDirectorate) {
                notifyNewMessage(msg.sender); // Notify the recipient of a new message
            }
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

function notifyNewMessage(sender) {
    const senderElement = document.getElementById(sender); // Assuming sender IDs match recipient IDs
    if (senderElement) {
        let newMessageIndicator = senderElement.querySelector('.new-message');
        if (!newMessageIndicator) {
            newMessageIndicator = document.createElement('span');
            newMessageIndicator.className = 'new-message';
            newMessageIndicator.textContent = ' (new message)';
            newMessageIndicator.style.color = 'green'; // Set the text color to green
            senderElement.appendChild(newMessageIndicator);
        }
        
        // Remove the indicator after a few seconds
        setTimeout(() => {
            if (newMessageIndicator) {
                senderElement.removeChild(newMessageIndicator);
            }
        }, 5000); // Notification lasts for 5 seconds
    }
}

function displayMessage(sender, message, file) {
    const messagesList = document.getElementById('messagesList');
    const messageItem = document.createElement('div');
    messageItem.classList.add('message');

    // Determine if the message is sent or received
    const isSent = sender === currentDirectorate; // Check if the sender is the current directorate

    // Set the class based on whether it is sent or received
    messageItem.classList.add(isSent ? 'sent' : 'received');

    // Create a message text element
    const messageText = document.createElement('p');
    messageText.textContent = `From ${sender}: ${message}`;
    messageItem.appendChild(messageText); // Append the message text

    // If there's a file, create a link for it
    if (file) {
        const fileLink = document.createElement('a');
        fileLink.href = `/download/${file}`; // Link to the download route
        fileLink.textContent = `Download ${file}`; // Show the file name in the message
        fileLink.target = "_blank"; // Open the file in a new tab
        fileLink.style.display = 'block'; // Make the link block level to start on a new line
        messageItem.appendChild(fileLink); // Append the file link below the message
    }

    messagesList.appendChild(messageItem); // Finally, append the message item to the list
}

// Initialize the page based on the directorate
const dirTitle = document.title.replace(" Messaging", "");
document.addEventListener('DOMContentLoaded', () => initialize(dirTitle));