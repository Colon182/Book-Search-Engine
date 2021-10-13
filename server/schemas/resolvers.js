const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async function (parent, args, context) {
            console.log("ME: args: ", args)
            if (context.user._id) {
                const userData = await User.findOne({
                    _id: context.user._id
                }).select('-__v -password');
                return userData;
            }

            throw new AuthenticationError('Not logged in!')
        }
    },

    Mutation: {
        addUser: async function (parent, { email, password}) {
            console.log("addUser: args: ", {email, password});
            const user = await User.findOne({ email});
            if (!user) {
                throw new AuthenticationError('No user with that email address')
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Password is Incorrect');
            }
            const token = signToken(user);;
            return { token, user}
        },

        login: async function (parent, { email, password }) {
            // console.log("args: ", args);
            console.log("login: email: ", email, " password: ", password);
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('Incorrect Credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect Credentials');
            }
            const token = signToken(user);
            return { token, user };
        },

        saveBook: async function (parent, { bookData }, context) {
            // console.log("args",  args);
            if (context.user) {
                // TODO:
                const book = await Book.create({bookData})
                await User.findOneAndUpdate(
                    { _id: context.user._id},
                    {$addToSet: {book: book.bookId} }
                );
                // return /* TODO: data to return */;
                return book;
            }

            throw new AuthenticationError('You need to be logged in!');

        },

        removeBook: async function (parent, args, context) {
            console.log("args: ", args);
            console.log(`context: ${context}`);
            if (context.user) {
                // ToODO:


                // return /* TODO: data to return */;
            }

            throw new AuthenticationError('You need to be logged in!');

        }
    }
}

module.exports = resolvers;