
const MovesMetric = ({ moves } : { moves: number }) => (
  <div
    className="tw-meter tw-bg-gray-lightest tw-rounded-sm tw-block tw-relative tw-transition-all tw-duration-150 tw-pt-2 after:tw-text-gray after:tw-font-bold after:tw-absolute after:tw-top-3 after:tw-right-2 dark:tw-bg-gray-darkest tw-w-66"
  >
    <dl className="tw-flex tw-flex-col tw-p-2">
      <div>
        <dt
          className="tw-m-0 tw-flex tw-w-full tw-min-w-full tw-flex-auto tw-items-center tw-gap-1 tw-text-sm tw-font-regular tw-leading-tight"
        >
          Total moves
        </dt>
        <dd className="tw-leading-none tw-mt-1.5 tw-flex tw-items-end tw-gap-1 tw-text-xl">{moves}</dd>
      </div>
    </dl>
  </div>
)

export default MovesMetric