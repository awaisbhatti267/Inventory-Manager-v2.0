const StatCard = ({
    icon: Icon,
    label,
    value,
    iconBg = 'from-[#0969FF] to-[#6C3EFF]',
    valueColor = 'text-blue-500',
}) => {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-bg)] p-5 sm:flex-row sm:items-center sm:gap-4">
            <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white ${iconBg}`}
            >
                <Icon size={22} />
            </div>

            <div className="min-w-0">
                <p className="mb-0.5 text-xs text-[var(--muted-color)]">{label}</p>
                <p className={`truncate text-[1.375rem] font-bold sm:text-2xl ${valueColor}`}>
                    {value}
                </p>
            </div>
        </div>
    );
};

export default StatCard;