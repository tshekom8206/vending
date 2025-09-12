import 'package:country_code_picker/country_code.dart';
import 'package:country_code_picker/country_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/util/color_category.dart';

import 'constant_widget.dart';

/// selection dialog used for selection of the country code
class SelectionDialog extends StatefulWidget {
  final List<CountryCode> elements;
  final bool? showCountryOnly;
  final InputDecoration searchDecoration;
  final TextStyle? searchStyle;
  final TextStyle? textStyle;
  final BoxDecoration? boxDecoration;
  final WidgetBuilder? emptySearchBuilder;
  final bool? showFlag;
  final double flagWidth;
  final Decoration? flagDecoration;
  final Size? size;
  final bool hideSearch;
  final Icon? closeIcon;

  /// Background color of SelectionDialog
  final Color? backgroundColor;

  /// Boxshaow color of SelectionDialog that matches CountryCodePicker barrier color
  final Color? barrierColor;

  /// elements passed as favorite
  final List<CountryCode> favoriteElements;

  SelectionDialog(
    this.elements,
    this.favoriteElements, {
    Key? key,
    this.showCountryOnly,
    this.emptySearchBuilder,
    InputDecoration searchDecoration = const InputDecoration(),
    this.searchStyle,
    this.textStyle,
    this.boxDecoration,
    this.showFlag,
    this.flagDecoration,
    this.flagWidth = 32,
    this.size,
    this.backgroundColor,
    this.barrierColor,
    this.hideSearch = false,
    this.closeIcon,
  })  : searchDecoration = searchDecoration.prefixIcon == null
            ? searchDecoration.copyWith(prefixIcon: const Icon(Icons.search))
            : searchDecoration,
        super(key: key);

  @override
  State<StatefulWidget> createState() => _SelectionDialogState();
}

class _SelectionDialogState extends State<SelectionDialog> {
  /// this is useful for filtering purpose
  late List<CountryCode> filteredElements;
  TextEditingController searchController = TextEditingController();

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: bgColor,
        body: SafeArea(
          child: ListView(
            primary: true,
            shrinkWrap: false,
            children: [
              getVerSpace(40.h),
              getAppBar("Select Country", () {
                Get.back();
              }).marginSymmetric(horizontal: 20.h),
              getVerSpace(30.h),
              defaultTextField(context, searchController, "Search...",
                      prefix: true,
                      prefixImage: "search.svg",
                      suffix: true,
                      suffixImage: "filter.svg",
                      onChanged: _filterElements)
                  .marginSymmetric(horizontal: 20.h),
              getVerSpace(30.h),
              widget.favoriteElements.isEmpty
                  ? const DecoratedBox(decoration: BoxDecoration())
                  : ListView.builder(
                    primary: false,
                    shrinkWrap: true,
                    itemCount: widget.favoriteElements.length,
                    itemBuilder: (context, index) {
                      return _buildOption(widget.favoriteElements[index]);
                    },
                  ),
              if (filteredElements.isEmpty)
                _buildEmptySearchWidget(context)
              else ...[
                ListView.builder(
                  primary: false,
                  shrinkWrap: true,
                  itemCount: filteredElements.length,
                  itemBuilder: (context, index) {
                    return _buildOption(filteredElements[index]);
                  },
                )
              ]
            ],
          ),
        ),
      );

  Widget _buildOption(CountryCode e) {
    return GestureDetector(
      onTap: (){
        _selectItem(e);
      },
      child: Container(
        margin: EdgeInsets.only(bottom: 20.h, left: 20.h, right: 20.h),
        height: 60.h,
        padding: EdgeInsets.symmetric(horizontal: 18.h),
        decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(16.h),
            border: Border.all(color: borderColor, width: 1.h)),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            Container(
              height: 28.h,
              width: 40.h,
              margin: const EdgeInsets.only(right: 16.0),
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(4.h),
                  image: DecorationImage(
                      image: AssetImage(
                        e.flagUri!,
                        package: 'country_code_picker',
                      ),
                      fit: BoxFit.fill)),
            ),
            Expanded(
              child: getCustomFont(e.toCountryStringOnly(), 16.sp, hintColor, 1,
                  fontWeight: FontWeight.w400),
            ),
            getCustomFont(e.dialCode ?? "", 16.sp, hintColor, 1,
                fontWeight: FontWeight.w400)
          ],
        ),
      ),
    );
    // return Container();
  }

  Widget _buildEmptySearchWidget(BuildContext context) {
    if (widget.emptySearchBuilder != null) {
      return widget.emptySearchBuilder!(context);
    }

    return Center(
      child: Text(CountryLocalizations.of(context)?.translate("no country") ??
          "no country found"),
    );
  }

  @override
  void initState() {
    filteredElements = widget.elements;
    super.initState();
  }

  void _filterElements(String s) {
    s = s.toUpperCase();
    setState(() {
      filteredElements = widget.elements
          .where((e) =>
              e.code!.contains(s) ||
              e.dialCode!.contains(s) ||
              e.name!.toUpperCase().contains(s))
          .toList();
    });
  }

  void _selectItem(CountryCode e) {
    Get.back(result: e);
  }
}
