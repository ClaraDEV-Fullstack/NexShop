const PageLoader = () => (
    <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
            <div className="relative h-10 w-10">
                <div className="absolute inset-0 rounded-full border-2 border-primary-200 dark:border-primary-800" />
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary-600" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
    </div>
);

export default PageLoader;
