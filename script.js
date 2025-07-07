document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.sidebar nav ul li a');
    const contentSections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('section-title');

    navLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();

            // Remove active class from all links and sections
            navLinks.forEach(navLink => navLink.parentElement.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active-section'));

            // Add active class to the clicked link and corresponding section
            this.parentElement.classList.add('active');
            const targetSectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active-section');
                // Update header title
                sectionTitle.textContent = this.textContent.replace(this.querySelector('.icon').textContent, '').trim();
            }
        });
    });

    // Optional: Simulate chat functionality for demonstration
    const chatInput = document.querySelector('.chat-input input');
    const chatSendButton = document.querySelector('.chat-input button');
    const chatMessagesContainer = document.querySelector('.chat-messages');

    if (chatInput && chatSendButton && chatMessagesContainer) {
        chatSendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        function sendMessage() {
            const messageText = chatInput.value.trim();
            if (messageText === '') return;

            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'sent');
            messageElement.textContent = messageText;
            chatMessagesContainer.appendChild(messageElement);

            chatInput.value = '';
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Scroll to bottom

            // Simulate a reply
            setTimeout(() => {
                const replyElement = document.createElement('div');
                replyElement.classList.add('message', 'received');
                replyElement.textContent = "感谢您的消息，我会尽快处理。";
                chatMessagesContainer.appendChild(replyElement);
                chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Scroll to bottom
            }, 1000);
        }
    }
});