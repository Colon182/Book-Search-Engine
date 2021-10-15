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
        addUser: async function (parent, args) {
            console.log("addUser: args: ", args);
            // TODO:
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };

            // return /* TODO: data to return */
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
            console.log("saveBook - bookData: ", bookData);
            if (context.user) {
                // TODO:
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData } },
                    { new: true }
                  );

                  return updatedUser;
                // return /* TODO: data to return */;
            }

            throw new AuthenticationError('You need to be logged in!');

        },

        removeBook: async function (parent, { bookId }, context) {
            console.log("removeBook: bookId: ", bookId);
            console.log(`removeBook: context.user._id: ${context.user?._id}`);
            if (context.user) {
                // ToODO:
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                  );

                  return updatedUser;

                // return /* TODO: data to return */;
            }

            throw new AuthenticationError('You need to be logged in!');

        }
    }
}

module.exports = resolvers;