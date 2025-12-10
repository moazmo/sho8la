// Input validation middleware using express-validator patterns
const validate = (validations) => {
    return async (req, res, next) => {
        const errors = [];

        for (const [field, rules] of Object.entries(validations)) {
            const value = req.body[field];

            if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
                errors.push(`${field} is required`);
                continue;
            }

            if (value) {
                if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errors.push(`${field} must be a valid email`);
                }
                if (rules.minLength && value.length < rules.minLength) {
                    errors.push(`${field} must be at least ${rules.minLength} characters`);
                }
                if (rules.maxLength && value.length > rules.maxLength) {
                    errors.push(`${field} must be at most ${rules.maxLength} characters`);
                }
                if (rules.min && Number(value) < rules.min) {
                    errors.push(`${field} must be at least ${rules.min}`);
                }
                if (rules.max && Number(value) > rules.max) {
                    errors.push(`${field} must be at most ${rules.max}`);
                }
                if (rules.enum && !rules.enum.includes(value)) {
                    errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
                }
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        next();
    };
};

// Pre-built validators
const validators = {
    register: validate({
        email: { required: true, email: true },
        password: { required: true, minLength: 6 },
        name: { required: true, minLength: 2, maxLength: 50 },
        role: { required: true, enum: ['client', 'freelancer', 'student'] }
    }),

    login: validate({
        email: { required: true, email: true },
        password: { required: true }
    }),

    job: validate({
        title: { required: true, minLength: 5, maxLength: 100 },
        description: { required: true, minLength: 20 },
        budget: { required: true, min: 1 }
    }),

    proposal: validate({
        jobId: { required: true },
        bidAmount: { required: true, min: 1 },
        deliveryDays: { required: true, min: 1, max: 365 },
        coverLetter: { required: true, minLength: 20 }
    }),

    payment: validate({
        jobId: { required: true },
        freelancerId: { required: true },
        amount: { required: true, min: 1 }
    })
};

module.exports = { validate, validators };
