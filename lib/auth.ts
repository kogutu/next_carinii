import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import Facebook from "next-auth/providers/facebook"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Apple({
            clientId: process.env.APPLE_ID!,
            clientSecret: process.env.APPLE_SECRET!,
        }),
        Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                name: { label: "Name", type: "text" },
                id: { label: "ID", type: "text" },
            },
            async authorize(credentials) {
                // Zwróć dane użytkownika po udanym logowaniu przez PHP API
                if (credentials?.email) {
                    return {
                        id: credentials.id as string,
                        email: credentials.email as string,
                        name: credentials.name as string,
                    }
                }
                return null
            },
        }),
    ],
    pages: {
        signIn: "/",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider !== "credentials") {
                try {
                    console.log("----------------------");
                    console.log("----------------------");


                    console.log("----------------------");
                    console.log({
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        nextauth: true,
                        provider: account?.provider,
                        providerId: account?.providerAccountId,
                    });
                    console.log("----------------------");
                    const response = await fetch(`https://sklep.carinii.com.pl/directseo/nextjs/user/login.php`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            nextauth: true,
                            provider: account?.provider,
                            providerId: account?.providerAccountId,
                        }),
                    })
                    const data = await response.json()

                    if (data.success) {
                        if (data.data) {
                            if (typeof window !== "undefined") {
                                localStorage.setItem("customer", JSON.stringify(data.data.customer))
                            }
                            user.name = data.data.customer.firstname;
                            user.id = data.data.customer.id
                            user.data = data.data.customer
                        }
                        return true
                    }
                } catch (error) {
                    console.error("OAuth backend sync error:", error)
                }
            }

            return true
        },
        async session({ session, token }) {
            // Dodaj custom dane do sesji


            if (token.sub) {
                session.user.id = token.sub
            }
            return session
        },
    },
})
