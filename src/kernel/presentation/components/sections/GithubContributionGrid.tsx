import { GitHubCalendar } from 'react-github-calendar';

function GithubContributionGrid({username}: {username: string}) {
    if (!username) return null;

    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto max-w-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    GitHub Contributions
                </h3>
                <span className="text-xs text-gray-400">@{username}</span>
            </div>

            <div className="flex justify-center">
                <GitHubCalendar
                    username={username}
                    blockSize={12}
                    blockMargin={4}
                    fontSize={12}
                    colorScheme="dark" // Change to "light" or omit to follow system theme
                    labels={{
                        totalCount: '{{count}} contributions in the last year',
                    }}
                />
            </div>
        </div>
    );
};

export default GithubContributionGrid;
