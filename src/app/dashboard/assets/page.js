import React from "react";
import { prisma } from "../../../lib/prisma";
import { getSessionUser } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { Image as ImageIcon } from "lucide-react";
import { withSignedImageUrls } from "../../../lib/storage";
import DownloadButton from "../../components/DownloadButton";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const imageRecords = await prisma.userImage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const images = await withSignedImageUrls(imageRecords);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">My Assets</h1>
          <p className="text-sm text-muted">Manage your uploaded subjects and photos.</p>
        </div>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <div key={img.id} className="aspect-square rounded-xl overflow-hidden border border-border bg-charcoal group relative shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.filename} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-end">
                  <DownloadButton url={img.url} filename={img.filename} />
                </div>
                <div>
                  <p className="text-[10px] text-white truncate font-medium">{img.filename}</p>
                  <p className="text-[9px] text-muted">{new Date(img.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-charcoal border border-border rounded-2xl">
          <ImageIcon className="w-12 h-12 text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">No Assets Yet</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            You haven&apos;t uploaded any photos to your library yet. Go to the Generator and upload a subject photo to save it here automatically!
          </p>
        </div>
      )}
    </div>
  );
}
