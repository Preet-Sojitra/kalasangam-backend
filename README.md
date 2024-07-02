# Kalasangam (Backend)

> This repository contains the backend code. To view the frontend code, head over to [this repository](https://github.com/Preet-Sojitra/Kalasangam). All the description and instructions are given there.

## Live Demo:

The project is not deployed yet. I will deploy it soon or either I will provide a live demo of the project on youtube soon.
<!-- You can view the live demo of Anuvaad Ratna [here](https://youtu.be/d3sqFWYGBTk?si=LiZHsLfnqdwJ4NRj). -->

## Team Members:

[Version 1.0](https://github.com/Preet-Sojitra/Kalasangam/tree/v1.0) of this project was developed by the following team members:

- Kunal Sahoo
- Kishan Pipariya
- Preet Sojitra
- Dharmi Patel
- Dev Parikh
- Saurav Navdhare
- Rashida Kadiwala
- Abhinav Sharma

## Usage:

To use Kalasangam, you need to run it on your local machine only as of now. To do so, follow these steps:

> You need to clone both the frontend and backend repositories to your local machine separately and start the servers for both of them separately.

1. Clone this repository to your local machine using following command:

```bash
git clone https://github.com/Preet-Sojitra/kalasangam-backend
```

2. Change the working directory to the backend repository's root directory and then change the working directory to `node_backend` directory using the following commands:

```bash
cd kalasangam-backend && cd node_backend
```

3. Start the docker container using the following command:

```bash
docker-compose up
```

4. Now, open a new terminal and run the following command to start the server:

```bash
npm run dev
```

5. Open new terminal tab and seed the database using the following command:

> But before running the following command, make sure that you have added Cloudinary credentials in the `.env` file. You can get the credentials by signing up on [Cloudinary](https://cloudinary.com/). It is most crucial part of the project as it is used to store the images. 

```bash
chmod +x seed.sh && ./seed.sh
```

> If file not found error occurs, then make sure you are in the root directory of the backend repository and then run the above command.
>
> Please note that the above command is for Linux and Mac users only. For Windows users, you need to run the following command in the git terminal:

```bash
sh seed.sh
```


> NOTE: You need to have Node.js and docker installed on your machine to run the above commands.

 Now, head over to the [frontend repository](https://github.com/Preet-Sojitra/Kalasangam) and clone it (if you haven't already).

