document.addEventListener('DOMContentLoaded', function() {
    const folderData = [
        { folderPath: 'Nebulia', totalImages: 4 },
        { folderPath: 'Ruins', totalImages: 5 },
        { folderPath: 'exoS', totalImages: 4 } 
    ];

    const cardContainer = document.getElementById('cardContainer');

    const specialCards = [
        {
            "folderPath": "Nebulia",
            "imageNumber": "03"
        },
        {
            "folderPath": "Ruins",
            "imageNumber": "02"
        },
        {
            "folderPath": "exoS",
            "imageNumber": "01"
        }
    ];

    folderData.forEach(data => {
        const folderPath = data.folderPath;
        const totalImages = data.totalImages;

        for (let i = 0; i < totalImages; i++) {
            let imageNumber = i.toString().padStart(2, '0');
            let imageName = `${imageNumber}.png`;

            const card = document.createElement('div');
            card.className = 'card';

            const isSpecial = specialCards.some(specialCard => 
                specialCard.folderPath === folderPath && specialCard.imageNumber === imageNumber
            );

            if (isSpecial) {
                card.classList.add('rainbow-border');
            }

            const imgElement = document.createElement('img');
            imgElement.src = `${folderPath}/${imageName}`;

            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';

            const cardText = document.createElement('h3');
            cardText.textContent = `${folderPath.toLocaleUpperCase()}`;

            cardContent.appendChild(cardText);
            card.appendChild(imgElement);
            card.appendChild(cardContent);
            cardContainer.appendChild(card);
        }
    });
});
