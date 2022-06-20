type EmailParamsInput = {
    email: string;
    subject: string;
    message: string;
    url: string;
}

const createEmailParams = ({email, subject, message, url}: EmailParamsInput) => {
    return {
        Destination: {
            CcAddresses: [],
            ToAddresses: [
                email
            ],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `<h1>
                        ${subject}.
                    </h1>
                    <p>${message}</p>
                    <a href="${url}">${url}</a>
                    `,
                },
                Text: {
                    Charset: "UTF-8",
                    Data: "Hello world",
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: `Collabory: ${subject}`,
            },
        },
        Source: process.env.EMAIL!,
        ReplyToAddresses: [
            process.env.EMAIL!
        ],
    };
};

export default createEmailParams;