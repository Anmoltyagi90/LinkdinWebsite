import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import UserLayout from "../layout/UserLayout";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  return (
    <UserLayout>
      <Head>
        <title>Social Platform</title>
        <meta name="description" content="Connect with friends" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-evenly items-center py-10 ">
          <div className="max-w-[500px] mb-6 md:mb-0">
            <p className="text-2xl font-semibold mb-4">
              Connect with Friends without Exaggeration
            </p>
            <p className="text-lg text-gray-600 font-mono">
              A True social media platform with stories, no bluffs!
            </p>

            <div
              className="btnn rounded-xl bg-blue-900 w-20 p-2 pl-2 text-white items-center cursor-pointer hover:bg-blue-800 transition mt-3"
              onClick={() => router.push("/login")}
            >
              Join now
            </div>
          </div>

          <div className="max-w-[500px]">
            <Image
              src="/image/image3.jpeg"
              alt="Social Media"
              width={500}
              height={400}
              className="rounded-lg object-cover"
            />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
