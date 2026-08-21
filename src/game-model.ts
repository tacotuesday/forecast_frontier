export type MissionId =
  | "graphics" | "decomposition" | "features" | "toolbox" | "regression"
  | "ets" | "arima" | "dynamic" | "hierarchy" | "advanced"
  | "practical" | "neural" | "foundation";

export type Control = {
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  labels?: Record<number, string>;
};

export type Mission = {
  id: MissionId;
  step: number;
  chapter: number;
  act: number;
  eyebrow: string;
  title: string;
  shortTitle: string;
  concept: string;
  objective: string;
  learn: string;
  fieldNote: string;
  success: string;
  dataTitle: string;
  color: string;
  primary: Control;
  secondary: Control;
  defaults: [number, number];
  target: [number, number];
  period: number;
};

const binary = (label: string, off: string, on: string): Control => ({ label, min: 0, max: 1, step: 1, labels: { 0: off, 1: on } });

export const missions: Mission[] = [
  {
    id: "graphics", step: 1, chapter: 2, act: 1, eyebrow: "OBSERVATION OUTPOST", title: "Read the Landscape", shortTitle: "Graphics", concept: "Plots, seasonality & autocorrelation", objective: "Identify the cycle before choosing a model.", learn: "Why time plots, seasonal plots, lag plots, and the ACF expose different structures.", fieldNote: "The strongest peaks repeat every 12 observations. Your ACF must look far enough back to confirm them.", success: "Pattern mapped! The seasonal period and ACF range both expose the repeating yearly cycle.", dataTitle: "Monthly visitor arrivals", color: "#ffd36a",
    primary: { label: "SEASONAL PERIOD", min: 4, max: 14, step: 1, unit: " months" }, secondary: { label: "MAX ACF LAG", min: 8, max: 24, step: 4, unit: " lags" }, defaults: [6, 8], target: [12, 24], period: 12,
  },
  {
    id: "decomposition", step: 2, chapter: 3, act: 1, eyebrow: "DECOMPOSITION DELTA", title: "Separate the Signal", shortTitle: "Decompose", concept: "Transformations, trend & seasonal components", objective: "Extract trend and seasonality without letting an outlier bend them.", learn: "How STL separates a series into trend-cycle, seasonal, and remainder components.", fieldNote: "An odd seasonal window near the middle is flexible enough for change; robust fitting protects against the visible spike.", success: "Components separated! The remainder is small and the trend is no longer distorted by the outlier.", dataTitle: "Quarterly retail turnover", color: "#f6b85b",
    primary: { label: "STL WINDOW", min: 3, max: 13, step: 2, unit: " points" }, secondary: binary("ROBUST FIT", "off", "on"), defaults: [3, 0], target: [7, 1], period: 4,
  },
  {
    id: "features", step: 3, chapter: 4, act: 1, eyebrow: "FEATURE FIELDS", title: "Describe the Series", shortTitle: "Features", concept: "Summary, ACF & STL features", objective: "Build a compact feature set that captures both dependence and seasonality.", learn: "How numerical features make large collections of series searchable and model-ready.", fieldNote: "One family of features misses important structure. Combine summary, ACF, and STL signals, then add enough lags to cover the local pattern.", success: "Feature set ready! You captured level, dependence, and seasonal strength without excessive lag inputs.", dataTitle: "Regional tourism demand", color: "#58d6ae",
    primary: { label: "FEATURE FAMILY", min: 1, max: 4, step: 1, labels: { 1: "summary", 2: "ACF", 3: "STL", 4: "all three" } }, secondary: { label: "LAG FEATURES", min: 1, max: 12, step: 1, unit: " lags" }, defaults: [1, 2], target: [4, 6], period: 4,
  },
  {
    id: "toolbox", step: 4, chapter: 5, act: 2, eyebrow: "BASELINE BASECAMP", title: "Earn Your Baseline", shortTitle: "Baselines", concept: "Naïve methods, residuals & accuracy", objective: "Choose the benchmark that respects the data’s seasonal structure.", learn: "Why every forecasting project needs a simple, honest benchmark and a true holdout set.", fieldNote: "The last observation is not enough when the same quarter behaves similarly each year.", success: "Baseline established! Seasonal naïve is the benchmark more complex models must now beat.", dataTitle: "Quarterly beer production", color: "#49c8a5",
    primary: { label: "BASELINE METHOD", min: 0, max: 3, step: 1, labels: { 0: "mean", 1: "naïve", 2: "seasonal naïve", 3: "drift" } }, secondary: { label: "HOLDOUT SIZE", min: 4, max: 12, step: 2, unit: " points" }, defaults: [0, 4], target: [2, 8], period: 4,
  },
  {
    id: "regression", step: 5, chapter: 7, act: 3, eyebrow: "REGRESSION RIDGE", title: "Explain the Movement", shortTitle: "Regression", concept: "Trend, seasonality & predictors", objective: "Use useful predictors without inflating the model.", learn: "How time-series regression combines trend, seasonal indicators, and external predictors.", fieldNote: "Temperature, price, and a trend explain the movement. Extra predictors add noise; a curved trend is unnecessary.", success: "Parsimonious fit! Three useful predictors and a linear trend generalize cleanly.", dataTitle: "Daily electricity demand", color: "#64c8d4",
    primary: { label: "PREDICTORS", min: 1, max: 5, step: 1, unit: " vars" }, secondary: { label: "TREND DEGREE", min: 1, max: 3, step: 1 }, defaults: [1, 3], target: [3, 1], period: 7,
  },
  {
    id: "ets", step: 6, chapter: 8, act: 3, eyebrow: "ETS ESTUARY", title: "Weight the Recent Past", shortTitle: "ETS", concept: "Exponential smoothing & damped trend", objective: "Balance recent information with a trend that should not run forever.", learn: "How ETS updates level and trend components using exponentially declining weights.", fieldNote: "A moderate alpha adapts without chasing noise. The growth is slowing, so damp the long-run trend.", success: "ETS tuned! Moderate smoothing and a damped trend track the level without runaway growth.", dataTitle: "Annual internet usage", color: "#56b8dc",
    primary: { label: "LEVEL ALPHA", min: 0.1, max: 0.9, step: 0.1 }, secondary: binary("DAMPED TREND", "off", "on"), defaults: [0.9, 0], target: [0.4, 1], period: 8,
  },
  {
    id: "arima", step: 7, chapter: 9, act: 3, eyebrow: "ARIMA ASCENT", title: "Make It Stationary", shortTitle: "ARIMA", concept: "Differencing, AR terms & diagnostics", objective: "Remove the trend, then model the remaining dependence.", learn: "How differencing creates stationarity and AR terms capture persistence in the residual process.", fieldNote: "One difference removes the trend. The PACF suggests two autoregressive terms; a second difference would erase useful structure.", success: "Stationarity reached! ARIMA with one difference and two AR terms leaves near-white residuals.", dataTitle: "Monthly exports index", color: "#6ba8e5",
    primary: { label: "DIFFERENCES (d)", min: 0, max: 2, step: 1 }, secondary: { label: "AR ORDER (p)", min: 0, max: 4, step: 1 }, defaults: [0, 0], target: [1, 2], period: 12,
  },
  {
    id: "dynamic", step: 8, chapter: 10, act: 3, eyebrow: "DYNAMIC CROSSING", title: "Add External Clues", shortTitle: "Dynamic", concept: "Regression with ARIMA errors", objective: "Use the leading predictor while accounting for autocorrelated errors.", learn: "How dynamic regression combines explanatory variables with time-series error structure.", fieldNote: "The promotion signal leads demand by one period, and ordinary regression still leaves serial correlation.", success: "Dynamic link found! A one-step predictor lag plus ARIMA errors captures cause and dependence.", dataTitle: "Weekly promotion demand", color: "#8c99e2",
    primary: { label: "PREDICTOR LAG", min: 0, max: 4, step: 1, unit: " steps" }, secondary: binary("ARIMA ERRORS", "off", "on"), defaults: [4, 0], target: [1, 1], period: 8,
  },
  {
    id: "hierarchy", step: 9, chapter: 11, act: 4, eyebrow: "HIERARCHY HARBOR", title: "Reconcile the Fleet", shortTitle: "Hierarchy", concept: "Coherent grouped forecasts", objective: "Make regional forecasts add up to the national total.", learn: "Why independently generated forecasts conflict and how reconciliation restores coherence.", fieldNote: "Bottom-up ignores useful aggregate information. Minimum-trace reconciliation uses every level while minimizing error variance.", success: "Fleet reconciled! MinT makes every level coherent while retaining information from the full hierarchy.", dataTitle: "National & regional sales", color: "#ad8bd4",
    primary: { label: "RECONCILIATION", min: 0, max: 2, step: 1, labels: { 0: "bottom-up", 1: "OLS", 2: "MinT" } }, secondary: { label: "LEVELS USED", min: 1, max: 3, step: 1, unit: " levels" }, defaults: [0, 1], target: [2, 3], period: 4,
  },
  {
    id: "advanced", step: 10, chapter: 12, act: 4, eyebrow: "MULTI-SEASONAL MARSH", title: "Track Two Clocks", shortTitle: "Advanced", concept: "Multiple seasonality & bagging", objective: "Capture overlapping cycles and stabilize the forecast.", learn: "How MSTL-style decomposition and bootstrap aggregation address complex seasonal data.", fieldNote: "Demand follows both daily and weekly clocks. A small bootstrap ensemble reduces variance without wasting computation.", success: "Two clocks synchronized! Both seasonal periods are represented and the ensemble is stable.", dataTitle: "Half-hourly electricity load", color: "#c47bc0",
    primary: { label: "SEASONAL PERIODS", min: 1, max: 3, step: 1, unit: " cycles" }, secondary: { label: "BOOTSTRAP SERIES", min: 0, max: 50, step: 10 }, defaults: [1, 0], target: [2, 30], period: 8,
  },
  {
    id: "practical", step: 11, chapter: 13, act: 4, eyebrow: "PRACTICAL PORT", title: "Ship a Safe Forecast", shortTitle: "Practical", concept: "Combinations & constraints", objective: "Improve robustness and keep impossible values out of production.", learn: "Why model combinations are often hard to beat and domain constraints matter after fitting.", fieldNote: "A small diverse ensemble is usually safer than betting on one model. Counts cannot fall below zero.", success: "Production ready! A three-model combination is stable and the non-negative constraint respects the domain.", dataTitle: "Daily pharmacy sales", color: "#d9799f",
    primary: { label: "MODELS COMBINED", min: 1, max: 5, step: 1, unit: " models" }, secondary: binary("NON-NEGATIVE", "off", "on"), defaults: [1, 0], target: [3, 1], period: 7,
  },
  {
    id: "neural", step: 12, chapter: 14, act: 5, eyebrow: "NEURAL SUMMIT", title: "Learn Nonlinear Memory", shortTitle: "Neural", concept: "MLPs, scaling & lagged inputs", objective: "Give the network enough history and capacity—without bloating it.", learn: "How lagged inputs, scaling, and hidden units shape a neural forecasting model.", fieldNote: "One full seasonal cycle belongs in the input window. Thirty-two hidden units are enough for this signal.", success: "Network balanced! A full seasonal input window and moderate hidden layer capture nonlinear structure.", dataTitle: "Monthly air passengers", color: "#ef766f",
    primary: { label: "INPUT LAGS", min: 3, max: 15, step: 3, unit: " lags" }, secondary: { label: "HIDDEN UNITS", min: 0, max: 3, step: 1, labels: { 0: "8 units", 1: "16 units", 2: "32 units", 3: "64 units" } }, defaults: [3, 0], target: [12, 2], period: 12,
  },
  {
    id: "foundation", step: 13, chapter: 15, act: 5, eyebrow: "FOUNDATION FRONTIER", title: "Adapt a Pretrained Model", shortTitle: "Foundation", concept: "Context, transfer & adaptation", objective: "Supply enough context and choose the lightest adaptation that works.", learn: "How pretrained forecasting models transfer patterns across datasets and adapt to new series.", fieldNote: "The model needs several seasonal cycles of context. A few examples are enough here; full fine-tuning would be excessive.", success: "Transfer complete! A 48-step context and few-shot adaptation deliver strong accuracy efficiently.", dataTitle: "Cross-domain electricity prices", color: "#ff6b4a",
    primary: { label: "CONTEXT LENGTH", min: 16, max: 64, step: 8, unit: " steps" }, secondary: { label: "ADAPTATION", min: 0, max: 2, step: 1, labels: { 0: "zero-shot", 1: "few-shot", 2: "fine-tune" } }, defaults: [16, 2], target: [48, 1], period: 8,
  },
];

export const chapterBriefs: Record<MissionId, [string, string]> = {
  graphics: [
    "Chapter 2 treats plotting as the first modeling decision. A correctly indexed time plot reveals level shifts, trend, changing variance, and unusual observations; seasonal and seasonal-subseries plots align comparable parts of each cycle so repeated calendar effects become visible. Scatterplots examine relationships between variables, while the stated data frequency suggests—but does not prove—the seasonal period.",
    "Lag plots compare each observation with earlier observations, and the autocorrelation function (ACF) summarizes those relationships over many lags. Slow ACF decay often signals trend; peaks at seasonal multiples signal repetition; correlations near zero are consistent with white noise. For this mission, choose a period that matches the visible yearly cycle, then extend the ACF far enough to see whether that peak repeats rather than stopping after the first coincidence.",
  ],
  decomposition: [
    "Chapter 3 begins by simplifying data through calendar, population, inflation, or mathematical adjustments. It then separates a series into trend-cycle, seasonal, and remainder components. Additive decomposition suits seasonal variation of roughly constant size; multiplicative decomposition—or a log/Box-Cox transformation followed by an additive method—better handles variation that grows with the series level.",
    "Moving averages and classical decomposition introduce the basic mechanics, while STL provides a more flexible decomposition whose seasonal pattern may evolve. Its smoothing window controls the trade-off between following genuine change and mistaking noise for seasonal movement. Robust STL downweights extreme observations so an anomaly does not distort the trend and seasonal estimates. In this mission, use the plot’s gradual seasonal evolution to choose the window and the visible spike to decide whether robustness is warranted.",
  ],
  features: [
    "Chapter 4 turns an entire time series into a compact vector of numerical descriptions. Simple statistics capture distribution and scale; ACF features measure persistence and seasonal dependence; STL features measure trend and seasonal strength. Other features can describe entropy, lumpiness, crossing points, and stability. Different feature families answer different questions, so a broad representation is useful when several kinds of structure coexist.",
    "Features are especially valuable when comparing many series: they support visualization, clustering, anomaly discovery, and global forecasting models. Lagged values can also become predictive inputs, but every added lag increases dimensionality and redundancy. For this mission, match feature families to the level, dependence, and seasonality visible in the data, then use enough lags to cover the local memory without assuming that the largest possible input set must be best.",
  ],
  toolbox: [
    "Chapter 5 lays out a complete forecasting workflow: prepare and plot the data, specify and estimate models, evaluate them, and only then produce forecasts. Mean, naïve, seasonal naïve, and drift forecasts are deliberately simple reference methods. The right benchmark must preserve obvious structure—especially seasonality—so a complex model earns credit only for improving on a credible alternative.",
    "The chapter distinguishes fitted values from genuine forecasts, uses residual diagnostics to look for bias and leftover autocorrelation, and treats forecasts as distributions with prediction intervals rather than single certain numbers. Accuracy must be measured on observations withheld from fitting, ideally with time-series cross-validation. For this mission, select the simple method that respects the quarterly cycle and a holdout long enough to cover the forecast horizon and represent every season fairly.",
  ],
  regression: [
    "Chapter 7 explains simple and multiple linear regression, least-squares estimation, fitted values, goodness-of-fit, and the assumptions behind valid inference and forecasting. Residual plots, their ACF, outliers, and influential observations reveal problems that a high R² can hide. Time itself, seasonal indicators, interventions, trading-day effects, and distributed lags can all be useful predictors when their timing and interpretation make sense.",
    "Predictor selection balances explanation against variance: irrelevant variables consume data and can make future performance worse, while omitted drivers leave systematic residual structure. Trend terms can be linear or curved, but higher degree should be justified out of sample rather than by training fit. In this mission, look for the smallest set that explains distinct movements in demand, and choose the simplest trend shape consistent with the gradual trajectory.",
  ],
  ets: [
    "Chapter 8 builds exponential smoothing from weighted averages whose influence declines into the past. Simple exponential smoothing updates a changing level; Holt’s method adds trend; damped Holt lets that trend flatten over longer horizons. Holt-Winters methods add additive or multiplicative seasonality, and the ETS taxonomy expresses combinations of error, trend, and seasonal components as state-space models with prediction distributions.",
    "Smoothing parameters determine how quickly each hidden component reacts. A high level alpha follows the newest observation closely but may chase noise, while a low alpha is stable but slow to adapt; estimation normally chooses the value that minimizes forecast error. Damping is valuable when extending current growth indefinitely is implausible. For this mission, weigh the series’ changing level against its short-run noise, then decide whether the visibly slowing trend should persist forever.",
  ],
  arima: [
    "Chapter 9 models dependence in a series after making its statistical behavior reasonably stable over time. Ordinary or seasonal differencing removes changing levels and recurring seasonal patterns; AR terms relate the present to past values, while MA terms relate it to past forecast errors. These pieces combine as ARIMA, with seasonal ARIMA extending the same logic across seasonal lags.",
    "Differencing should stop once stationarity is reached because over-differencing amplifies noise and destabilizes forecasts. ACF and PACF plots, unit-root tests, information criteria, and automated search suggest candidate orders, but residuals must still resemble white noise. In this mission, first choose the smallest difference order that removes the trend, then use the short-lag dependence—especially the PACF cutoff—to choose a parsimonious AR order.",
  ],
  dynamic: [
    "Chapter 10 combines regression predictors with ARIMA errors. The regression portion explains demand using external information, while the ARIMA error process captures serial dependence the predictors leave behind. Forecasts therefore require both a fitted relationship and future predictor values or defensible scenarios. The chapter also contrasts deterministic and stochastic trends and uses Fourier terms for long or complex seasonal cycles.",
    "Timing is central: a lagged predictor asks whether an earlier value of an input leads the target, not merely whether the two move together. A predictor arriving after the forecast origin cannot help a real forecast even if its historical correlation is high. For this mission, align the promotion with the delayed response visible in demand, then inspect whether ordinary regression errors still carry autocorrelation that an ARIMA error model should absorb.",
  ],
  hierarchy: [
    "Chapter 11 covers series that must obey aggregation rules, such as regions summing to a national total or products grouped across several classifications. Forecasting every node independently usually breaks those rules. Bottom-up, top-down, and middle-out approaches choose one level as the source of forecasts, but each discards information estimated elsewhere in the structure.",
    "Forecast reconciliation starts with base forecasts and adjusts them so all totals are coherent. OLS uses the hierarchy’s geometry, while MinT also uses forecast-error covariance to minimize the variance of the reconciled errors; probabilistic forecasts need coherent distributions as well as coherent means. For this mission, decide whether to preserve information from every level and whether the error structure justifies MinT rather than a simpler single-level approach.",
  ],
  advanced: [
    "Chapter 12 collects methods for structures that simpler single-series models handle poorly. MSTL and dynamic harmonic regression represent multiple seasonal periods; Prophet offers a modular trend-seasonality-holiday formulation; vector autoregressions model several mutually related series. The appropriate method follows the data-generating structure, not the method’s novelty.",
    "The chapter also bootstraps time series by resampling remainder behavior while preserving the fitted structure, then bags forecasts across the reconstructed series. Averaging can reduce variance and sensitivity to one sample, though gains eventually level off. In this mission, count the distinct calendar clocks visible in half-hourly demand and use enough bootstrap members for a stable ensemble without adding a nonexistent seasonal cycle or needless computation.",
  ],
  practical: [
    "Chapter 13 addresses complications that appear in deployed forecasting: weekly, daily, and sub-daily calendars; count data; limits on possible values; backcasting; very short or long histories; and missing values or outliers. These are not cosmetic details. They determine which transformations, seasonal structures, validation windows, and output constraints make sense for the real decision.",
    "Forecast combinations are a practical defense against model uncertainty because competent models often make different errors. Simple averaging is frequently difficult to beat, while constraints keep forecasts inside the target’s legitimate range—for example, sales counts cannot be negative. In this mission, choose a small, diverse ensemble rather than many copies of the same idea, and apply the physical lower bound without treating it as a substitute for model diagnostics.",
  ],
  neural: [
    "Chapter 14 frames neural forecasting as supervised learning from windows of past observations and optional external variables. A multilayer perceptron learns nonlinear combinations of lagged inputs; modern architectures extend the idea with specialized mechanisms for sequence structure. Scaling is essential because optimization is sensitive to variable magnitude, and probabilistic objectives allow networks to predict distributions rather than only means.",
    "Neural capacity comes from both the information supplied and the number of parameters used to process it. Too short an input window omits seasonal context; too many lags or hidden units increase computation and overfitting risk. Hyperparameters should be chosen with time-ordered validation and compared against strong statistical baselines. For this mission, include a full seasonal cycle in the inputs and use only enough hidden capacity to learn the remaining nonlinear relationship.",
  ],
  foundation: [
    "Chapter 15 introduces transformer attention and foundation forecasting models trained across large collections of series. Pretraining lets one model reuse patterns learned in other domains, making zero-shot forecasts possible when target data are scarce. The chapter surveys several model families and emphasizes potential advantages such as broad transfer, probabilistic output, and reduced task-specific training.",
    "Transfer still depends on supplying informative context and choosing an adaptation strategy. Zero-shot inference is cheapest; few-shot examples can calibrate the model to a new domain; fine-tuning changes model weights and needs enough representative data to justify its cost and overfitting risk. External variables may add information too. For this mission, provide several repetitions of the local cycle, then choose the lightest adaptation that corrects the domain shift.",
  ],
};

export type MasteryGuide = {
  paragraphs: [string, string];
  reading: Array<{ label: string; url: string }>;
  chapterUrl: string;
};

export const masteryGuides: Record<MissionId, MasteryGuide> = {
  graphics: {
    paragraphs: [
      "The highest-scoring seasonal period is {primary}. For monthly data, a 12-month period compares each month with the same month one year earlier, so winter is compared with winter rather than summer. That alignment makes the repeated cycle visible and gives the forecast a meaningful seasonal clock. A shorter or longer period pairs unlike parts of the cycle, blurring the relationship and increasing holdout error.",
      "The best ACF setting, {secondary}, looks across two full yearly cycles. Peaks near lags 12 and 24 are stronger evidence of recurring seasonality than a single isolated peak, while the shape between them reveals shorter-term persistence. On a new dataset, begin with its recording frequency and calendar, then confirm—not assume—the period using seasonal, lag, and ACF plots. If the peaks do not repeat, investigate trend, changing seasonality, or multiple seasonal periods before modeling.",
    ],
    reading: [
      { label: "§2.7 Lag plots", url: "https://otexts.com/fpppy/02-graphics.html#lag-plots" },
      { label: "§2.8 Autocorrelation", url: "https://otexts.com/fpppy/02-graphics.html#autocorrelation" },
    ],
    chapterUrl: "https://otexts.com/fpppy/02-graphics.html",
  },
  decomposition: {
    paragraphs: [
      "The 100-point reference uses a {primary} STL window, which controls how quickly the estimated seasonal pattern may change. A seven-point window is smooth enough to avoid treating random quarter-to-quarter variation as seasonality, yet flexible enough to follow gradual evolution in the cycle. Windows that are too narrow leak noise into the seasonal component; windows that are too wide can hide genuine changes and leave them in the remainder.",
      "The strongest configuration sets robust fitting {secondary}. Robust STL reduces the influence of the visible outlier while estimating trend and seasonality, so one unusual observation does not bend every component around it. For new data, inspect all three components: the seasonal component should be stable and interpretable, the trend should move gradually, and the remainder should look unstructured except for genuine anomalies. Revisit the window or transformation if structure remains in the remainder.",
    ],
    reading: [
      { label: "§3.2 Time-series components", url: "https://otexts.com/fpppy/03-decomposition.html#time-series-components" },
      { label: "§3.6 STL decomposition", url: "https://otexts.com/fpppy/03-decomposition.html#stl-decomposition" },
    ],
    chapterUrl: "https://otexts.com/fpppy/03-decomposition.html",
  },
  features: {
    paragraphs: [
      "The highest-scoring feature family, {primary}, combines complementary evidence: summary features describe scale and variability, ACF features describe serial dependence, and STL features quantify trend and seasonal strength. No single family fully describes this series. The combined representation scored best because the model could distinguish level, persistence, and seasonality instead of using one kind of signal as a proxy for all three.",
      "The reference setting of {secondary} supplies enough recent history to represent the local dynamics without flooding the model with redundant inputs. More lags raise dimensionality and can encourage overfitting; too few omit useful dependence. On a new collection of series, choose features that correspond to the structures visible in plots, standardize them when scales differ, and validate the lag count out of sample rather than assuming that more features always help.",
    ],
    reading: [
      { label: "§4.2 ACF features", url: "https://otexts.com/fpppy/04-features.html#acf-features" },
      { label: "§4.3 STL features", url: "https://otexts.com/fpppy/04-features.html#stl-features" },
    ],
    chapterUrl: "https://otexts.com/fpppy/04-features.html",
  },
  toolbox: {
    paragraphs: [
      "The strongest benchmark here is {primary}. Because this quarterly series repeats every four observations, seasonal naïve forecasts each quarter from the same quarter one year earlier. That is stronger than the mean, ordinary naïve, or drift methods: those alternatives ignore the recurring within-year pattern. A useful benchmark should be simple but should not deliberately discard the most obvious structure in the data.",
      "A {secondary} holdout reveals two complete seasonal cycles, so the comparison covers every quarter more than once rather than depending on one lucky or unlucky observation. On new problems, keep the test set completely outside model fitting and make it at least as long as the forecast horizon—preferably long enough to represent every important season. Any complex model should earn its place by beating an appropriate benchmark on this unseen period.",
    ],
    reading: [
      { label: "§5.2 Seasonal naïve method", url: "https://otexts.com/fpppy/05-toolbox.html#seasonal-naïve-method" },
      { label: "§5.8 Training and test sets", url: "https://otexts.com/fpppy/05-toolbox.html#training-and-test-sets" },
    ],
    chapterUrl: "https://otexts.com/fpppy/05-toolbox.html",
  },
  regression: {
    paragraphs: [
      "The best reference model uses {primary} and a degree-{secondary} trend. Temperature, price, and time each add distinct predictive information here; the fourth and fifth candidate variables mostly add noise. The linear trend captures the gradual movement without inventing curvature that is weakly supported by the short history. This is the bias–variance trade-off in practical form: enough structure to explain movement, but not enough freedom to memorize the training sample.",
      "For a new regression problem, start with predictors that will actually be known at forecast time and have a defensible relationship with the target. Compare candidate sets using time-ordered validation, not in-sample R² alone, then inspect residuals for remaining trend, seasonality, autocorrelation, and changing variance. A compact model that leaves clean residuals is usually more transferable than a larger model selected only because it fits history closely.",
    ],
    reading: [
      { label: "§7.4 Useful predictors", url: "https://otexts.com/fpppy/07-regression.html#some-useful-predictors" },
      { label: "§7.5 Selecting predictors", url: "https://otexts.com/fpppy/07-regression.html#selecting-predictors" },
    ],
    chapterUrl: "https://otexts.com/fpppy/07-regression.html",
  },
  ets: {
    paragraphs: [
      "The highest-scoring level smoothing value, {primary}, gives recent observations substantial—but not overwhelming—weight. A value near one would chase each noisy movement, while a value near zero would adapt too slowly when the level changes. The moderate value won on the holdout because it responds to the current level while still averaging away short-lived fluctuations.",
      "The reference model sets damped trend {secondary}, allowing short-run growth to continue while gradually reducing its contribution farther into the future. Undamped Holt forecasts extend the latest slope indefinitely, which is rarely credible for growth that is already slowing. On new data, estimate smoothing parameters from forecast error, compare damped and undamped trends out of sample, and check whether the forecast horizon makes indefinite extrapolation especially risky.",
    ],
    reading: [
      { label: "§8.1 Optimisation", url: "https://otexts.com/fpppy/08-exponential-smoothing.html#optimisation" },
      { label: "§8.2 Damped trend methods", url: "https://otexts.com/fpppy/08-exponential-smoothing.html#damped-trend-methods" },
    ],
    chapterUrl: "https://otexts.com/fpppy/08-exponential-smoothing.html",
  },
  arima: {
    paragraphs: [
      "The 100-point reference uses {primary} and {secondary}. One ordinary difference converts changes in the trending level into a roughly stable series, satisfying the stationarity requirement without removing more information than necessary. With no differencing, the AR terms try to imitate the trend; with two differences, the series becomes unnecessarily noisy and forecasts can become unstable.",
      "Two autoregressive terms then capture the remaining short-memory dependence: recent changes contain information about the next change, but more distant lags contribute little. On new data, difference only until the mean is stable, use ACF/PACF patterns and information criteria to propose orders, and finish with residual diagnostics. The goal is not a particular ARIMA label; it is a parsimonious model whose residuals resemble white noise.",
    ],
    reading: [
      { label: "§9.1 Stationarity and differencing", url: "https://otexts.com/fpppy/09-arima.html#stationarity-and-differencing" },
      { label: "§9.5 ACF and PACF plots", url: "https://otexts.com/fpppy/09-arima.html#acf-and-pacf-plots" },
    ],
    chapterUrl: "https://otexts.com/fpppy/09-arima.html",
  },
  dynamic: {
    paragraphs: [
      "The best predictor setting, {primary}, aligns the promotion signal with the demand response one period later. Using lag zero assumes an immediate effect; longer lags arrive after the observed response. Correct temporal alignment matters because a predictor can be strongly related to the target yet be useless—or unavailable—at the required forecast origin.",
      "The strongest configuration sets ARIMA errors {secondary}, allowing the regression to explain the promotion effect while the error model captures persistence left over in demand. Ordinary regression assumes uncorrelated errors; violating that assumption wastes predictable structure and distorts uncertainty. On new data, test plausible leading relationships using domain timing, ensure future predictor values are available, then inspect regression residuals for autocorrelation before choosing an error model.",
    ],
    reading: [
      { label: "§10.2 Regression with ARIMA errors", url: "https://otexts.com/fpppy/10-dynamic-regression.html#regression-with-arima-errors-using-statsforecast" },
      { label: "§10.6 Lagged predictors", url: "https://otexts.com/fpppy/10-dynamic-regression.html#lagged-predictors" },
    ],
    chapterUrl: "https://otexts.com/fpppy/10-dynamic-regression.html",
  },
  hierarchy: {
    paragraphs: [
      "The best reference uses {primary} with {secondary}. Forecasts produced independently at regional, state, and national levels will not normally add up. MinT adjusts all of them together so they become coherent while using the estimated error covariance to place smaller adjustments on the more reliable information. Bottom-up is coherent too, but it discards potentially useful forecasts made at aggregate levels.",
      "Using all levels gives reconciliation the full information set and preserves the accounting relationships decision-makers expect. On a new hierarchy, define the summing structure first, generate sensible base forecasts at every required node, estimate forecast-error covariance carefully, and verify both coherence and accuracy after reconciliation. Coherence is a constraint—not proof of accuracy—so compare reconciliation methods with time-series cross-validation.",
    ],
    reading: [
      { label: "§11.3 Forecast reconciliation", url: "https://otexts.com/fpppy/11-hierarchical-forecasting.html#forecast-reconciliation" },
      { label: "§11.3 MinT optimal reconciliation", url: "https://otexts.com/fpppy/11-hierarchical-forecasting.html#the-mint-optimal-reconciliation-approach" },
    ],
    chapterUrl: "https://otexts.com/fpppy/11-hierarchical-forecasting.html",
  },
  advanced: {
    paragraphs: [
      "The strongest configuration models {primary}, which represents both recurring clocks in the half-hourly demand data rather than forcing one seasonal pattern to absorb the other. A single period leaves systematic structure in the remainder; a third period adds complexity without a corresponding pattern. Methods such as MSTL are useful precisely because daily and weekly effects can coexist and evolve separately.",
      "The reference {secondary} form an ensemble large enough to average over plausible remainder paths and reduce forecast variance. Too few resamples leave the result sensitive to a particular reconstruction, while additional resamples eventually bring little improvement. On new data, identify each cycle from the calendar and spectral/ACF evidence, preserve temporal dependence when resampling, and choose ensemble size by stability and validation rather than by maximizing computation.",
    ],
    reading: [
      { label: "§12.1 Complex seasonality", url: "https://otexts.com/fpppy/12-advanced.html#complex-seasonality" },
      { label: "§12.4 Bootstrapping and bagging", url: "https://otexts.com/fpppy/12-advanced.html#bootstrapping-and-bagging" },
    ],
    chapterUrl: "https://otexts.com/fpppy/12-advanced.html",
  },
  practical: {
    paragraphs: [
      "The strongest ensemble combines {primary}. Their errors are not identical, so averaging reduces the risk that one model’s miss dominates the final forecast. One model is fragile; adding a few diverse, competent models usually stabilizes error. Adding still more near-duplicate models contributes little diversity and can dilute the stronger members.",
      "The reference sets the domain constraint {secondary}, preventing impossible negative forecasts for sales counts. Constraints should encode facts about the outcome, not conceal a badly specified model, so accuracy still needs to be checked before and after applying them. On new problems, combine models that fail differently, use validation-based or simple equal weights, and apply bounds or transformations that match the true support of the variable.",
    ],
    reading: [
      { label: "§13.3 Forecast limits", url: "https://otexts.com/fpppy/13-practical.html#ensuring-forecasts-stay-within-limits" },
      { label: "§13.4 Forecast combinations", url: "https://otexts.com/fpppy/13-practical.html#forecast-combinations" },
    ],
    chapterUrl: "https://otexts.com/fpppy/13-practical.html",
  },
  neural: {
    paragraphs: [
      "The best input window, {primary}, gives the MLP one complete yearly cycle of monthly observations. That lets it compare the current position with the same seasonal positions in the past instead of learning seasonality indirectly from an incomplete window. Shorter windows omit relevant context; longer ones add correlated inputs and parameters that this small dataset cannot estimate reliably.",
      "The reference {secondary} provide enough nonlinear capacity to model interactions between level, trend, and seasonal lags without the instability of a much wider layer. On new data, scale inputs using training data only, choose lags from the forecast horizon and seasonal structure, and tune capacity with rolling validation. Neural models are not automatically superior: compare them with strong statistical baselines and repeat training when random initialization matters.",
    ],
    reading: [
      { label: "§14.2 Multilayer perceptron", url: "https://otexts.com/fpppy/14-neural-networks.html#multilayer-perceptron" },
      { label: "§14.4 Scaling the data", url: "https://otexts.com/fpppy/14-neural-networks.html#scaling-the-data" },
      { label: "§14.7 Hyperparameter optimisation", url: "https://otexts.com/fpppy/14-neural-networks.html#hyperparameter-optimisation" },
    ],
    chapterUrl: "https://otexts.com/fpppy/14-neural-networks.html",
  },
  foundation: {
    paragraphs: [
      "The best context length, {primary}, exposes six eight-step cycles, giving the pretrained model enough local history to identify this series’ scale, phase, and recent regime. Too little context makes several different processes look alike; excessive context can add stale regimes and unnecessary cost. Context length should cover the structures needed for the horizon, not simply the longest window the model accepts.",
      "The reference adaptation, {secondary}, supplies a small amount of domain-specific evidence without updating the whole pretrained network. Zero-shot use misses a local calibration detail here, while full fine-tuning adds cost and overfitting risk that the limited target data cannot justify. On new data, establish a zero-shot baseline first, add representative examples or covariates, and fine-tune only when repeated out-of-sample gains justify the additional data and maintenance burden.",
    ],
    reading: [
      { label: "§15.2 Transfer learning", url: "https://otexts.com/fpppy/15-foundation-models.html#transfer-learning" },
      { label: "§15.3 Foundation model overview", url: "https://otexts.com/fpppy/15-foundation-models.html#overview-of-foundation-models" },
      { label: "§15.4 Fine-tuning", url: "https://otexts.com/fpppy/15-foundation-models.html#fine-tuning" },
    ],
    chapterUrl: "https://otexts.com/fpppy/15-foundation-models.html",
  },
};

export const TRAIN_LENGTH = 40;
export const PASS_SCORE = 80;

export function formatControl(control: Control, value: number) {
  return control.labels?.[value] ?? `${Number.isInteger(value) ? value : value.toFixed(1)}${control.unit ?? ""}`;
}

export function makeSeries(mission: Mission) {
  const index = mission.step - 1;
  const period = mission.period;
  return Array.from({ length: 48 }, (_, t) => {
    const trend = t * (0.48 + (index % 4) * 0.07);
    const seasonal = Math.sin((2 * Math.PI * t) / period) * (7 + (index % 3) * 2);
    const harmonic = Math.cos((2 * Math.PI * t) / Math.max(3, period / 2)) * (1.4 + (index % 2));
    const deterministicNoise = (((t * 17 + index * 11) % 13) - 6) * 0.28;
    return 46 + index * 2.2 + trend + seasonal + harmonic + deterministicNoise;
  });
}

function stepDistance(value: number, target: number, control: Control) {
  return Math.abs(value - target) / control.step;
}

export function makeForecast(mission: Mission, primary: number, secondary: number) {
  const series = makeSeries(mission);
  const actual = series.slice(TRAIN_LENGTH);
  const d1 = stepDistance(primary, mission.target[0], mission.primary);
  const d2 = stepDistance(secondary, mission.target[1], mission.secondary);
  const distance = d1 + d2;
  return actual.map((value, i) => {
    const irreducible = Math.sin((i + 1) * 1.73 + mission.step * 0.39) * 1.05;
    const miss = distance * 0.34 * (1 + i * 0.08) * (i % 2 === 0 ? 1 : -0.72);
    return value + irreducible + miss;
  });
}

export function seasonalNaive(mission: Mission) {
  const series = makeSeries(mission);
  const train = series.slice(0, TRAIN_LENGTH);
  return Array.from({ length: series.length - TRAIN_LENGTH }, (_, i) => train[train.length - mission.period + (i % mission.period)]);
}

const FORECAST_CACHE = new Map<string, { forecast: number[]; actual: number[] }>();
const BASELINE_CACHE = new Map<string, number[]>();

function rmse(actual: number[], forecast: number[]) {
  return Math.sqrt(actual.reduce((sum, value, i) => sum + (value - forecast[i]) ** 2, 0) / actual.length);
}

export function evaluate(mission: Mission, primary: number, secondary: number) {
  const cacheKey = `${mission.id}:${primary}:${secondary}`;
  let cached = FORECAST_CACHE.get(cacheKey);

  // Single makeSeries call — reused for both model and target entries
  if (!cached) {
    const series = makeSeries(mission);
    const actual = series.slice(TRAIN_LENGTH);
    cached = { forecast: makeForecast(mission, primary, secondary), actual };
    FORECAST_CACHE.set(cacheKey, cached);
  }

  // Target comparison also reuses the same series (once per cache miss)
  const targetCacheKey = `${mission.id}:target`;
  let targetCached = FORECAST_CACHE.get(targetCacheKey);
  if (!targetCached) {
    const actual = cached ? cached.actual : makeSeries(mission).slice(TRAIN_LENGTH);
    targetCached = { forecast: makeForecast(mission, mission.target[0], mission.target[1]), actual };
    FORECAST_CACHE.set(targetCacheKey, targetCached);
  }

  // Cache the baseline so seasonalNaive() doesn't re-generate the series.
  const baselineKey = `${mission.id}:__baseline__`;
  let baselineCached = BASELINE_CACHE.get(baselineKey);
  if (!baselineCached) {
    baselineCached = seasonalNaive(mission);
    BASELINE_CACHE.set(baselineKey, baselineCached);
  }

  const modelRmse = rmse(cached.actual, cached.forecast);
  const bestRmse = rmse(targetCached.actual, targetCached.forecast);
  const baselineRmse = rmse(cached.actual, baselineCached);
  const score = Math.max(0, Math.min(100, Math.round((bestRmse / modelRmse) * 100)));
  const skill = Math.round((1 - modelRmse / baselineRmse) * 100);
  return { forecast: cached.forecast, rmse: modelRmse, baselineRmse, skill, score, passed: score >= PASS_SCORE };
}

const BEST_SCORE_CACHE = new Map<MissionId, number>();

export function enumerateValues(control: Control) {
  const values: number[] = [];
  for (let value = control.min; value <= control.max + control.step / 100; value += control.step) values.push(Number(value.toFixed(6)));
  return values;
}

export function bestAchievableScore(mission: Mission) {
  const cached = BEST_SCORE_CACHE.get(mission.id);
  if (cached !== undefined) return cached;

  let maxScore = -Infinity;
  for (const p of enumerateValues(mission.primary)) {
    for (const s of enumerateValues(mission.secondary)) {
      const score = evaluate(mission, p, s).score;
      if (score > maxScore) maxScore = score;
      if (maxScore === 100) break;
    }
    if (maxScore === 100) break;
  }

  BEST_SCORE_CACHE.set(mission.id, maxScore);
  return maxScore;
}

