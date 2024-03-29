// const paginationContainer = document.getElementById('pagination');


// document.addEventListener('DOMContentLoaded', async function() {

//     paginationContainer.innerHTML = '';

//     const totalPages = Math.ceil(data.length / itemsPerPage);

//     for (let i = 1; i <= totalPages; i++) {
//         const pageLink = document.createElement('a');
//         pageLink.href = '#';
//         pageLink.textContent = i;
//         pageLink.addEventListener('click', () => {
//             currentPage = i;
//             displayTableServiceData(data);
//         });
//         paginationContainer.appendChild(pageLink);
//     }

//     const nextPageButton = document.createElement('a');
//     nextPageButton.href = '#';
//     nextPageButton.innerHTML = '<i class="bx bx-right-arrow-alt"></i>';
//     nextPageButton.addEventListener('click', () => {
//         if (currentPage < totalPages) {
//             currentPage++;
//             displayTableServiceData(data);
//         }
//     });
//     paginationContainer.appendChild(nextPageButton);

// })