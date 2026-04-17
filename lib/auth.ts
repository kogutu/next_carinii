import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import Facebook from "next-auth/providers/facebook"
import Credentials from "next-auth/providers/credentials"

// Rozszerzenie typów dla sesji i tokena
declare module "next-auth" {
    interface Session {
        user: {
            id?: string
            email?: string | null
            name?: string | null
            image?: string | null
            data?: any
            projectId?: string  // Dodaj identyfikator projektu
            projectType?: string // Dodaj typ projektu
        }
    }

    interface User {
        data?: any
        projectId?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        projectId?: string
        projectType?: string
    }
}

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
                if (credentials?.email) {
                    return {
                        id: credentials.id as string,
                        email: credentials.email as string,
                        name: credentials.name as string,
                        projectId: process.env.PROJECT_ID, // Dodaj ID projektu
                        projectType: process.env.PROJECT_TYPE,
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
            // Dodaj ID projektu do usera przy logowaniu
            user.projectId = process.env.PROJECT_ID
            user.projectType = process.env.PROJECT_TYPE

            if (account?.provider !== "credentials") {
                try {
                    console.log("----------------------");
                    console.log("Project ID:", process.env.PROJECT_ID);
                    console.log("Project Type:", process.env.PROJECT_TYPE);
                    console.log("----------------------");

                    console.log({
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        nextauth: true,
                        provider: account?.provider,
                        providerId: account?.providerAccountId,
                        projectId: process.env.PROJECT_ID, // Wyślij ID projektu do API
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
                            projectId: process.env.PROJECT_ID, // Wyślij ID projektu
                            projectType: process.env.PROJECT_TYPE,
                        }),
                    })
                    const data = await response.json()

                    if (data.success) {
                        if (data.data) {
                            if (typeof window !== "undefined") {
                                // Zapisz w localStorage z prefiksem projektu
                                const storageKey = `customer_${process.env.PROJECT_ID}`
                                localStorage.setItem(storageKey, JSON.stringify(data.data.customer))
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
        async jwt({ token, user, account }) {
            // Dodaj ID projektu do tokena JWT
            if (user) {
                token.projectId = user.projectId || process.env.PROJECT_ID
                token.projectType = user.projectType || process.env.PROJECT_TYPE
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            // Dodaj custom dane do sesji z tokena
            if (token.sub) {
                session.user.id = token.sub
            }

            // Dodaj ID projektu do sesji
            session.user.projectId = token.projectId as string
            session.user.projectType = token.projectType as string

            return session
        },
    },
})