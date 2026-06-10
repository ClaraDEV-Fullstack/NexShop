import { HiLightningBolt } from 'react-icons/hi';

const BackendStatusBanner = ({ status }) => {
    if (status !== 'warming') return null;

    return (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
            <span className="inline-flex items-center gap-2">
                <HiLightningBolt className="h-4 w-4 animate-pulse" />
                Waking up the server — this usually takes under a minute on first visit.
            </span>
        </div>
    );
};

export default BackendStatusBanner;
